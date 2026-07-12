import type { Metadata } from 'next';
import { Text } from '@chakra-ui/react';
import { Page } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import { CORPUS_LIST, DEFAULT_CORPUS_ID } from '@/lib/corpora';
import AskClient from '@/app/ask/AskClient';

export const metadata: Metadata = {
  title: 'Ask',
  description:
    'Ask a question about the regulation and get an answer with the exact clause cited. Runs on Dubai tenancy law and the UAE eInvoicing mandate.',
  alternates: { canonical: '/ask' },
};

export default async function AskPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <Page maxW="3xl">
      <PageHeader eyebrow="Ask with citations" title="Ask the regulation">
        Answered only from the corpus, every claim carries a citation that links to the exact
        requirement unit. Ask in English or Arabic. If the corpus does not cover it, the answer says
        so: refusal is a feature.
      </PageHeader>
      <Reveal delay={160}>
        <AskClient
          corpusOptions={CORPUS_LIST.map(c => ({ id: c.id, shortName: c.shortName }))}
          defaultCorpusId={DEFAULT_CORPUS_ID}
          initialQuestion={typeof q === 'string' ? q.slice(0, 500) : ''}
        />
      </Reveal>
      <Text mt="10" fontSize="xs" color="fg.subtle">
        Demo only, not legal advice. In case of conflict the Arabic text of the law prevails.
      </Text>
    </Page>
  );
}
