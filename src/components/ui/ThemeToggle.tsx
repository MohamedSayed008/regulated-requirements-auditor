'use client';

import { useTheme } from 'next-themes';
import { Box, Button, ClientOnly, Skeleton } from '@chakra-ui/react';

/**
 * Light/dark switch, following the official Chakra v3 color-mode pattern:
 * next-themes owns the state (class attribute on <html>), and ClientOnly
 * defers the icon to the client so it never mismatches the server render.
 */
export function ThemeToggle() {
  return (
    <ClientOnly fallback={<Skeleton w="8" h="8" rounded="full" flexShrink="0" />}>
      <ToggleButton />
    </ClientOnly>
  );
}

function ToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  return (
    <Button
      type="button"
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title="Toggle light / dark"
      variant="outline"
      size="xs"
      w="8"
      h="8"
      minW="8"
      flexShrink="0"
      rounded="full"
      borderColor="border.default"
      bg="transparent"
      color="fg.muted"
      transition="color 0.2s, border-color 0.2s"
      _hover={{ color: 'fg.default', borderColor: 'law.solid', bg: 'transparent' }}
    >
      <Box as="span" aria-hidden="true" fontSize="md" lineHeight="1">
        {isLight ? '☀' : '☾'}
      </Box>
    </Button>
  );
}
