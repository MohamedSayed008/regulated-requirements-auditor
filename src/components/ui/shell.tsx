import { Box, Container, Flex, HStack, Link, Text } from '@chakra-ui/react';
import { type ReactNode } from 'react';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/requirements', label: 'Requirements' },
  { href: '/ask', label: 'Ask' },
  { href: '/audit', label: 'Audit' },
];

export function Nav() {
  return (
    <Box borderBottomWidth="1px" borderColor="border.default" bg="bg.canvas">
      <Container maxW="4xl" py="3">
        <Flex justify="space-between" align="center">
          <Link href="/" fontFamily="heading" fontWeight="bold" color="fg.default">
            Mizan{' '}
            <Text as="span" color="fg.subtle">
              ميزان
            </Text>
          </Link>
          <HStack gap="5">
            {NAV.slice(1).map(item => (
              <Link
                key={item.href}
                href={item.href}
                fontSize="sm"
                color="fg.muted"
                _hover={{ color: 'accent.fg' }}
              >
                {item.label}
              </Link>
            ))}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}

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
