'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Badge, Button, HStack, Input, Popover, Portal, Stack, Text } from '@chakra-ui/react';

type ChipState = 'unknown' | 'viewer' | 'reviewer';

/**
 * Global session control in the nav. The nav is rendered per page, so this
 * component remounts on every navigation; a module-scoped cache of the last
 * resolved role means a remount starts from that role instead of flashing an
 * empty placeholder. Before the first resolution the trigger renders disabled
 * (stable footprint, no hide/show) rather than hidden.
 */
let cachedRole: ChipState = 'unknown';

export function SessionChip() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<ChipState>(cachedRole);

  useEffect(() => {
    let cancelled = false;
    const resolve = (role: ChipState) => {
      if (cancelled) return;
      cachedRole = role;
      setState(role);
    };
    void fetch('/api/session', { method: 'GET' })
      .then(response => (response.ok ? response.json() : { role: 'viewer' }))
      .then((body: { role?: string }) => resolve(body.role === 'reviewer' ? 'reviewer' : 'viewer'))
      .catch(() => resolve('viewer'));
    return () => {
      cancelled = true;
    };
    // Re-check on navigation so a rotated or expired session stays honest.
  }, [pathname]);

  function setRole(role: ChipState) {
    cachedRole = role;
    setState(role);
    router.refresh();
  }

  if (state === 'reviewer') {
    return (
      <HStack gap="2" flexShrink="0">
        <Badge colorPalette="green" variant="subtle" rounded="full">
          reviewer
        </Badge>
        <Button
          size="xs"
          variant="outline"
          borderColor="border.default"
          color="fg.muted"
          _hover={{ color: 'fg.default', borderColor: 'accent.solid' }}
          onClick={() => {
            void fetch('/api/session', { method: 'DELETE' }).then(() => setRole('viewer'));
          }}
        >
          Sign out
        </Button>
      </HStack>
    );
  }

  // 'viewer' shows the interactive trigger; 'unknown' shows it disabled while
  // the first session check is in flight, keeping the footprint stable.
  return <SignInPopover disabled={state === 'unknown'} onSignedIn={() => setRole('reviewer')} />;
}

function SignInPopover({ disabled, onSignedIn }: { disabled: boolean; onSignedIn: () => void }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'failed'>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password || status === 'pending') return;
    setStatus('pending');
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setStatus('failed');
        return;
      }
      setPassword('');
      setStatus('idle');
      setOpen(false);
      onSignedIn();
    } catch {
      setStatus('failed');
    }
  }

  const trigger = (
    <Button
      size="xs"
      variant="ghost"
      color="fg.subtle"
      _hover={{ color: 'fg.default', bg: 'transparent' }}
      flexShrink="0"
      disabled={disabled}
    >
      Reviewer sign in
    </Button>
  );

  if (disabled) return trigger;

  return (
    <Popover.Root
      open={open}
      onOpenChange={details => {
        setOpen(details.open);
        if (!details.open) setStatus('idle');
      }}
      positioning={{ placement: 'bottom-end' }}
    >
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border.default"
            rounded="xl"
            maxW="72"
            boxShadow="0 16px 40px -16px rgba(0, 0, 0, 0.6)"
          >
            <Popover.Arrow>
              <Popover.ArrowTip borderColor="border.default" bg="bg.panel" />
            </Popover.Arrow>
            <Popover.Body p="4">
              <form onSubmit={handleSubmit}>
                <Stack gap="2.5">
                  <Text fontSize="xs" color="fg.muted">
                    Reviewer decisions persist to the audit trail and unlock event detail on the
                    activity log.
                  </Text>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Reviewer password"
                    aria-label="Reviewer password"
                    size="sm"
                    bg="bg.canvas"
                    borderColor="border.default"
                    color="fg.default"
                    _placeholder={{ color: 'fg.subtle' }}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    bg="accent.solid"
                    color="white"
                    _hover={{ bg: 'teal.600' }}
                    loading={status === 'pending'}
                    disabled={password.length === 0}
                  >
                    Sign in
                  </Button>
                  {status === 'failed' && (
                    <Text fontSize="xs" color="warn.fg">
                      That password was not accepted.
                    </Text>
                  )}
                </Stack>
              </form>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
