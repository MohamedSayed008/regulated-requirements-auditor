'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  CloseButton,
  Container,
  Drawer,
  Flex,
  HStack,
  IconButton,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react';
import { MizanBeam } from '@/components/icons/MizanMark';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SessionChip } from '@/components/ui/SessionChip';
import { isRtl, langFromPathname, localePath, stripLocale, translations } from '@/lib/i18n';

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();
  const lang = langFromPathname(pathname);
  const t = translations[lang].nav;
  const basePath = stripLocale(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const dir = isRtl(lang) ? 'rtl' : 'ltr';
  // The language switcher swaps the locale prefix but keeps the route.
  const otherLocaleHref = lang === 'ar' ? basePath : localePath('ar', basePath);

  return (
    <Box
      as="header"
      dir={dir}
      position="sticky"
      top="0"
      zIndex="10"
      borderBottomWidth="1px"
      borderColor="border.default"
      bg="nav.bg"
      backdropFilter="blur(14px)"
    >
      <Container maxW="6xl" py="3.5">
        <Flex align="center" gap={{ base: '3', md: '6' }}>
          <Box asChild flexShrink="0">
            <NextLink href={localePath(lang, '/')} aria-label={t.home}>
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

          <Box as="nav" aria-label="Primary" ms="auto" display={{ base: 'none', md: 'block' }}>
            <HStack gap="6">
              {t.items.map(item => (
                <NavItem
                  key={item.href}
                  href={localePath(lang, item.href)}
                  label={item.label}
                  active={isActive(basePath, item.href)}
                  orientation="horizontal"
                />
              ))}
            </HStack>
          </Box>

          <HStack gap="2" flexShrink="0" ms={{ base: 'auto', md: '0' }}>
            <SessionChip lang={lang} />

            <Box
              asChild
              fontSize="sm"
              fontWeight="500"
              color="fg.muted"
              px="2"
              py="1"
              rounded="md"
              flexShrink="0"
              transition="color 0.2s"
              _hover={{ color: 'fg.default' }}
              fontFamily={lang === 'ar' ? 'body' : 'arabic'}
            >
              <NextLink href={otherLocaleHref} aria-label={t.langSwitchAria}>
                {t.langSwitch}
              </NextLink>
            </Box>

            <ThemeToggle lang={lang} />

            <Box
              asChild
              display={{ base: 'none', md: 'inline-flex' }}
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
              <NextLink href={localePath(lang, '/ask')}>{t.tryIt}</NextLink>
            </Box>

            <Drawer.Root
              open={menuOpen}
              onOpenChange={details => setMenuOpen(details.open)}
              placement="end"
              size="xs"
            >
              <Drawer.Trigger asChild>
                <IconButton
                  aria-label={t.openMenu}
                  variant="outline"
                  size="xs"
                  w="8"
                  h="8"
                  minW="8"
                  rounded="full"
                  flexShrink="0"
                  display={{ base: 'inline-flex', md: 'none' }}
                  borderColor="border.default"
                  bg="transparent"
                  color="fg.muted"
                  _hover={{ color: 'fg.default', borderColor: 'law.solid', bg: 'transparent' }}
                >
                  <MenuIcon />
                </IconButton>
              </Drawer.Trigger>
              <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                  <Drawer.Content
                    dir={dir}
                    bg="bg.panel"
                    borderStartWidth="1px"
                    borderColor="border.default"
                  >
                    <Drawer.Header borderBottomWidth="1px" borderColor="border.default">
                      <Drawer.Title fontFamily="serif" fontWeight="600" color="fg.default">
                        {t.menu}
                      </Drawer.Title>
                    </Drawer.Header>
                    <Drawer.Body px="0" py="2">
                      <Stack gap="0">
                        {t.items.map(item => (
                          <NavItem
                            key={item.href}
                            href={localePath(lang, item.href)}
                            label={item.label}
                            active={isActive(basePath, item.href)}
                            orientation="vertical"
                            onNavigate={() => setMenuOpen(false)}
                          />
                        ))}
                      </Stack>
                    </Drawer.Body>
                    <Drawer.Footer borderTopWidth="1px" borderColor="border.default">
                      <Box
                        asChild
                        w="full"
                        textAlign="center"
                        fontSize="sm"
                        fontWeight="600"
                        color="bg.canvas"
                        bg="law.fg"
                        rounded="full"
                        px="4"
                        py="2"
                        transition="background 0.2s"
                        _hover={{ bg: 'law.solid' }}
                      >
                        <NextLink
                          href={localePath(lang, '/ask')}
                          onClick={() => setMenuOpen(false)}
                        >
                          {t.tryIt}
                        </NextLink>
                      </Box>
                    </Drawer.Footer>
                    <Drawer.CloseTrigger asChild>
                      <CloseButton
                        size="sm"
                        color="fg.muted"
                        _hover={{ color: 'fg.default', bg: 'transparent' }}
                      />
                    </Drawer.CloseTrigger>
                  </Drawer.Content>
                </Drawer.Positioner>
              </Portal>
            </Drawer.Root>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}

interface NavItemProps {
  href: string;
  label: string;
  active: boolean;
  orientation: 'horizontal' | 'vertical';
  onNavigate?: () => void;
}

function NavItem({ href, label, active, orientation, onNavigate }: NavItemProps) {
  const horizontal = orientation === 'horizontal';
  return (
    <Box
      asChild
      fontWeight={active ? 'medium' : 'normal'}
      color={active ? 'accent.fg' : 'fg.muted'}
      borderColor={active ? 'accent.solid' : 'transparent'}
      transition="color 0.2s"
      _hover={{ color: 'fg.default' }}
      {...(horizontal
        ? { fontSize: 'sm', borderBottomWidth: '2px', pb: '0.5' }
        : { fontSize: 'md', borderStartWidth: '2px', ps: '5', pe: '4', py: '2.5' })}
    >
      <NextLink href={href} aria-current={active ? 'page' : undefined} onClick={onNavigate}>
        {label}
      </NextLink>
    </Box>
  );
}

function MenuIcon() {
  return (
    <Box as="span" aria-hidden="true" display="inline-flex">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </Box>
  );
}
