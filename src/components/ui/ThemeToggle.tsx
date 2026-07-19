'use client';

import { useTheme } from 'next-themes';
import { Box, Button, ClientOnly, Skeleton } from '@chakra-ui/react';
import { type Lang, translations } from '@/lib/i18n';

/**
 * Light/dark switch, following the official Chakra v3 color-mode pattern:
 * next-themes owns the state (class attribute on <html>), and ClientOnly
 * defers the icon to the client so it never mismatches the server render.
 */
export function ThemeToggle({ lang = 'en' }: { lang?: Lang }) {
  return (
    <ClientOnly fallback={<Skeleton w="8" h="8" rounded="full" flexShrink="0" />}>
      <ToggleButton lang={lang} />
    </ClientOnly>
  );
}

function ToggleButton({ lang }: { lang: Lang }) {
  const { resolvedTheme, setTheme } = useTheme();
  const t = translations[lang].theme;
  const isLight = resolvedTheme === 'light';
  return (
    <Button
      type="button"
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      aria-label={isLight ? t.toDark : t.toLight}
      title={t.title}
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
