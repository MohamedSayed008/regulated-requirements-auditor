import type { Metadata } from 'next';
import { Text } from '@chakra-ui/react';
import { Page } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import { CORPUS_LIST, DEFAULT_CORPUS_ID } from '@/lib/corpora';
import { type Lang, translations } from '@/lib/i18n';
import AskClient from '@/app/ask/AskClient';

export const metadata: Metadata = {
  title: 'Ask',
  description:
    'Ask a question about the regulation and get an answer with the exact clause cited. Runs on Dubai tenancy law and the UAE eInvoicing mandate.',
  alternates: {
    canonical: '/ask',
    languages: { 'en-US': '/ask', ar: '/ar/ask', 'x-default': '/ask' },
  },
};

export default async function AskPage({
  searchParams,
  lang = 'en',
}: {
  searchParams: Promise<{ q?: string }>;
  lang?: Lang;
}) {
  const { q } = await searchParams;
  const t = translations[lang].ask;
  return (
    <Page maxW="3xl" lang={lang}>
      <PageHeader eyebrow={t.eyebrow} title={t.title} lang={lang}>
        {t.lede}
      </PageHeader>
      <Reveal delay={160}>
        <AskClient
          corpusOptions={CORPUS_LIST.map(c => ({ id: c.id, shortName: c.shortName }))}
          defaultCorpusId={DEFAULT_CORPUS_ID}
          initialQuestion={typeof q === 'string' ? q.slice(0, 500) : ''}
          lang={lang}
        />
      </Reveal>
      <Text mt="10" fontSize="xs" color="fg.subtle">
        {t.pageDisclaimer}
      </Text>
    </Page>
  );
}
