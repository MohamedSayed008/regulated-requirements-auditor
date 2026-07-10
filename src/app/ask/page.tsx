import type { Metadata } from 'next';
import { Heading, Stack, Text } from '@chakra-ui/react';
import { Page } from '@/components/ui/shell';
import AskClient from '@/app/ask/AskClient';

export const metadata: Metadata = {
  title: 'Ask: Mizan',
  description: 'Ask questions about Dubai tenancy law and get answers with the exact clause cited.',
};

export default function AskPage() {
  return (
    <Page maxW="3xl">
      <Stack gap="4" mb="10">
        <Text
          fontSize="sm"
          fontWeight="semibold"
          letterSpacing="0.2em"
          textTransform="uppercase"
          color="accent.fg"
        >
          Ask with citations
        </Text>
        <Heading fontFamily="heading" fontSize="3xl">
          Ask the regulation
        </Heading>
        <Text color="fg.muted" maxW="xl">
          Questions are answered only from the corpus, and every claim carries a citation that links
          to the exact requirement unit. Ask in English or Arabic. If the corpus does not cover it,
          the answer says so: refusal is a feature.
        </Text>
      </Stack>
      <AskClient />
      <Text mt="10" fontSize="xs" color="fg.subtle">
        Demo only, not legal advice. In case of conflict the Arabic text of the law prevails.
      </Text>
    </Page>
  );
}
