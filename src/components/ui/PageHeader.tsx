import { type ReactNode } from 'react';
import { Heading, Stack, Text } from '@chakra-ui/react';
import { Reveal } from '@/components/ui/Reveal';
import { type Lang } from '@/lib/i18n';

/**
 * Interior-page header: mono teal eyebrow, serif display title, muted lede.
 * Keeps every route speaking the same typographic system.
 */
export function PageHeader({
  eyebrow,
  title,
  children,
  maxW = '64ch',
  lang = 'en',
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  maxW?: string;
  lang?: Lang;
}) {
  return (
    <Stack gap="4" mb="10">
      <Reveal>
        <Text
          fontFamily="heading"
          fontSize="xs"
          letterSpacing="0.2em"
          textTransform="uppercase"
          color="accent.fg"
        >
          {eyebrow}
        </Text>
      </Reveal>
      <Reveal delay={60}>
        <Heading
          as="h1"
          fontFamily={lang === 'ar' ? 'arabic' : 'serif'}
          fontWeight="400"
          fontSize={{ base: '3xl', md: '5xl' }}
          lineHeight="1.1"
        >
          {title}
        </Heading>
      </Reveal>
      {children && (
        <Reveal delay={120}>
          <Text fontSize="lg" color="fg.muted" lineHeight="1.6" maxW={maxW}>
            {children}
          </Text>
        </Reveal>
      )}
    </Stack>
  );
}
