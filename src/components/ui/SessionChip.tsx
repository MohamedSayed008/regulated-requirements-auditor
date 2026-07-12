'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Badge, Box, Button, HStack, Input, Popover, Portal, Stack, Text } from '@chakra-ui/react';

type ChipState = 'unknown' | 'viewer' | 'reviewer';

/**
 * Global session control in the nav. Sign-in happens right here in a popover,
 * the chip flips to the reviewer badge immediately on success (no reload), and
 * router.refresh() re-renders the server components that depend on the role.
 * The load-time whoami call is also the sliding-rotation touchpoint.
 */
export function SessionChip() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<ChipState>('unknown');

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/session', { method: 'GET' })
      .then(response => (response.ok ? response.json() : { role: 'viewer' }))
      .then((body: { role?: string }) => {
        if (!cancelled) setState(body.role === 'reviewer' ? 'reviewer' : 'viewer');
      })
      .catch(() => {
        if (!cancelled) setState('viewer');
      });
    return () => {
      cancelled = true;
    };
    // Re-check when the route changes so a rotated/expired session stays honest.
  }, [pathname]);

  if (state === 'unknown') return <Box w="16" />;

  if (state === 'viewer') {
    return (
      <SignInPopover
        onSignedIn={() => {
          setState('reviewer');
          router.refresh();
        }}
      />
    );
  }

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
          void fetch('/api/session', { method: 'DELETE' }).then(() => {
            setState('viewer');
            router.refresh();
          });
        }}
      >
        Sign out
      </Button>
    </HStack>
  );
}

function SignInPopover({ onSignedIn }: { onSignedIn: () => void }) {
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

  return (
    <Popover.Root
      open={open}
      onOpenChange={details => {
        setOpen(details.open);
        if (!details.open) setStatus('idle');
      }}
      positioning={{ placement: 'bottom-end' }}
    >
      <Popover.Trigger asChild>
        <Button
          size="xs"
          variant="ghost"
          color="fg.subtle"
          _hover={{ color: 'fg.default', bg: 'transparent' }}
          flexShrink="0"
        >
          Reviewer sign in
        </Button>
      </Popover.Trigger>
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
