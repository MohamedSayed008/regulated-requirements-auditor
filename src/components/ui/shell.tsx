import { Box, Container } from '@chakra-ui/react';
import { type ReactNode } from 'react';
import { type Lang, isRtl } from '@/lib/i18n';

/**
 * Page content container. The persistent chrome (nav, ambient background,
 * footer, and the <main> landmark) lives in `app/layout.tsx` so it survives
 * navigation; this only constrains the per-route content width and sets the
 * locale direction. `bleed` lets a page (home) render full-width sections and
 * manage its own containers.
 */
export function Page({
  children,
  maxW = '5xl',
  bleed = false,
  lang = 'en',
}: {
  children: ReactNode;
  maxW?: string;
  bleed?: boolean;
  lang?: Lang;
}) {
  const rtl = isRtl(lang);
  const dir = rtl ? 'rtl' : undefined;
  const langAttr = rtl ? 'ar' : undefined;
  if (bleed) {
    return (
      <Box dir={dir} lang={langAttr}>
        {children}
      </Box>
    );
  }
  return (
    <Container dir={dir} lang={langAttr} maxW={maxW} py="16">
      {children}
    </Container>
  );
}
