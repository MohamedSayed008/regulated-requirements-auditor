import { Box, Container } from '@chakra-ui/react';
import { type ReactNode } from 'react';
import { Nav } from '@/components/layout/Nav';

export function Page({ children, maxW = '4xl' }: { children: ReactNode; maxW?: string }) {
  return (
    <Box minH="100dvh" bg="bg.canvas">
      <Nav />
      <Container maxW={maxW} py="12" as="main">
        {children}
      </Container>
    </Box>
  );
}
