'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Container, Flex, HStack, Text } from '@chakra-ui/react';
import { MizanMark } from '@/components/icons/MizanMark';

const NAV = [
  { href: '/requirements', label: 'Requirements' },
  { href: '/ask', label: 'Ask' },
  { href: '/audit', label: 'Audit' },
  { href: '/audit-repo', label: 'Audit a repo' },
  { href: '/review', label: 'Review' },
  { href: '/evals', label: 'Evals' },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();
  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="10"
      borderBottomWidth="1px"
      borderColor="border.default"
      bg="bg.canvas"
    >
      <Container maxW="4xl" py="3">
        <Flex align="center" gap="6">
          <Box
            asChild
            flexShrink="0"
            color="accent.fg"
            _hover={{ color: 'teal.400' }}
            transition="color 0.15s"
          >
            <NextLink href="/" aria-label="Mizan, home">
              <HStack gap="2.5" align="center">
                <MizanMark width="26" height="26" />
                <HStack gap="1.5" align="baseline">
                  <Text fontFamily="heading" fontWeight="bold" fontSize="md" color="fg.default">
                    Mizan
                  </Text>
                  <Text fontSize="sm" color="fg.subtle" aria-hidden="true">
                    ميزان
                  </Text>
                </HStack>
              </HStack>
            </NextLink>
          </Box>

          <Box
            as="nav"
            aria-label="Primary"
            ms="auto"
            overflowX="auto"
            css={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
          >
            <HStack gap="5" minW="max-content">
              {NAV.map(item => {
                const active = isActive(pathname, item.href);
                return (
                  <Box
                    key={item.href}
                    asChild
                    fontSize="sm"
                    fontWeight={active ? 'medium' : 'normal'}
                    color={active ? 'accent.fg' : 'fg.muted'}
                    borderBottomWidth="2px"
                    borderColor={active ? 'accent.solid' : 'transparent'}
                    pb="0.5"
                    transition="color 0.15s"
                    _hover={{ color: 'accent.fg' }}
                  >
                    <NextLink href={item.href} aria-current={active ? 'page' : undefined}>
                      {item.label}
                    </NextLink>
                  </Box>
                );
              })}
            </HStack>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
