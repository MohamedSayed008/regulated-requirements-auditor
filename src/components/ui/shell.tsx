import { Box, Container } from '@chakra-ui/react';
import { type ReactNode } from 'react';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';

/**
 * Site shell: sticky nav, ambient gold/teal radial glow over the warm-ink
 * canvas, content container, footer. `bleed` lets a page (home) render
 * full-width sections and manage its own containers.
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
  return (
    <Box
      minH="100dvh"
      display="flex"
      flexDirection="column"
      bg="bg.canvas"
      backgroundImage="radial-gradient(120% 90% at 85% -10%, rgba(230, 205, 134, 0.07), transparent 55%), radial-gradient(90% 70% at 5% 110%, rgba(15, 118, 110, 0.10), transparent 55%)"
      transition="background 0.3s"
    >
      <Nav />
      {bleed ? (
        <Box as="main" flex="1">
          {children}
        </Box>
      ) : (
        <Container maxW={maxW} py="16" as="main" flex="1">
          {children}
        </Container>
      )}
      <Footer />
    </Box>
  );
}
