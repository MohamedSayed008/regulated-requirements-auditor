'use client';

import { usePathname } from 'next/navigation';
import { Container, Flex, HStack, Text } from '@chakra-ui/react';
import { MizanMark } from '@/components/icons/MizanMark';
import { isRtl, langFromPathname, translations } from '@/lib/i18n';

export function Footer() {
  const pathname = usePathname();
  const lang = langFromPathname(pathname);
  const t = translations[lang].footer;

  return (
    <Flex
      as="footer"
      dir={isRtl(lang) ? 'rtl' : 'ltr'}
      borderTopWidth="1px"
      borderColor="border.default"
      bg="bg.panel"
    >
      <Container maxW="6xl" py="10">
        <Flex justify="space-between" align="center" gap="6" flexWrap="wrap">
          <HStack gap="2.5" color="law.fg">
            <MizanMark width="24" height="24" />
            <Text fontFamily="serif" fontSize="md" color="fg.default">
              Mizan
            </Text>
            <Text fontFamily="arabic" fontSize="md" aria-hidden="true">
              ميزان
            </Text>
          </HStack>
          <Text fontSize="xs" color="fg.subtle" maxW="60ch" lineHeight="1.6">
            {t.disclaimer}
          </Text>
        </Flex>
      </Container>
    </Flex>
  );
}
