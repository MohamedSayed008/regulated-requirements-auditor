import { Container } from '@chakra-ui/react';
import { type ReactNode } from 'react';

/**
 * Page content container. The persistent chrome (nav, ambient background,
 * footer, and the <main> landmark) lives in `app/layout.tsx` so it survives
 * navigation; this only constrains the per-route content width. `bleed` lets a
 * page (home) render full-width sections and manage its own containers.
 */
export function Page({
  children,
  maxW = '5xl',
  bleed = false,
}: {
  children: ReactNode;
  maxW?: string;
  bleed?: boolean;
}) {
  if (bleed) return <>{children}</>;
  return (
    <Container maxW={maxW} py="16">
      {children}
    </Container>
  );
}
