'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Container, Flex, HStack, Text } from '@chakra-ui/react';
import { MizanBeam } from '@/components/icons/MizanMark';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const NAV = [
  { href: '/requirements', label: 'Requirements' },
  { href: '/ask', label: 'Ask' },
  { href: '/audit', label: 'Audit' },
  { href: '/audit-repo', label: 'Audit a repo' },
  { href: '/review', label: 'Review' },
  { href: '/evals', label: 'Evals' },
  { href: '/activity', label: 'Activity' },
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
      bg="nav.bg"
      backdropFilter="blur(14px)"
    >
      <Container maxW="6xl" py="3.5">
        <Flex align="center" gap="6">
          <Box asChild flexShrink="0">
            <NextLink href="/" aria-label="Mizan, home">
              <HStack gap="2.5" align="center">
                <Box
                  color="law.fg"
                  display="inline-flex"
                  animation="swayBeam 6s ease-in-out infinite"
                  _motionReduce={{ animation: 'none' }}
                  transformOrigin="50% 18%"
                >
                  <MizanBeam width="26" height="15" />
                </Box>
                <HStack gap="2" align="baseline">
                  <Text fontFamily="serif" fontWeight="600" fontSize="lg" color="fg.default">
                    Mizan
                  </Text>
                  <Text fontFamily="arabic" fontSize="lg" color="law.fg" aria-hidden="true">
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
            <HStack gap="6" minW="max-content">
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
                    transition="color 0.2s"
                    _hover={{ color: 'fg.default' }}
                  >
                    <NextLink href={item.href} aria-current={active ? 'page' : undefined}>
                      {item.label}
                    </NextLink>
                  </Box>
                );
              })}
            </HStack>
          </Box>

          <ThemeToggle />

          <Box
            asChild
            flexShrink="0"
            display={{ base: 'none', sm: 'inline-flex' }}
            fontSize="sm"
            fontWeight="600"
            color="bg.canvas"
            bg="law.fg"
            rounded="full"
            px="4"
            py="1.5"
            transition="background 0.2s"
            _hover={{ bg: 'law.solid' }}
          >
            <NextLink href="/ask">Try it</NextLink>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
