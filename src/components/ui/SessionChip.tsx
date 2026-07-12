'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Badge, Box, Button, HStack } from '@chakra-ui/react';

type ChipState = 'unknown' | 'viewer' | 'reviewer';

/**
 * Global session indicator in the nav. On load it asks /api/session who the
 * visitor is, which is also the sliding-rotation touchpoint: an active session
 * past the rotation window comes back with a fresh cookie. Viewers get a quiet
 * sign-in link; the reviewer sees the role and can sign out from any page.
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
    // Re-check when the route changes so sign-in on /review updates the chip.
  }, [pathname]);

  if (state === 'unknown') return <Box w="16" />;

  if (state === 'viewer') {
    return (
      <Box
        asChild
        flexShrink="0"
        fontSize="xs"
        color="fg.subtle"
        _hover={{ color: 'fg.default' }}
        transition="color 0.2s"
      >
        <NextLink href="/review">Reviewer sign in</NextLink>
      </Box>
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
