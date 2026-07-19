import type { Metadata } from 'next';
import { Box, Text } from '@chakra-ui/react';
import { Page } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import { CORPUS_LIST } from '@/lib/corpora';
import { type Lang, translations } from '@/lib/i18n';
import { formatArticleRef } from '@/lib/i18n-data';
import { citedRequirementIds } from '@/lib/readiness';
import { type ReadinessClause } from '@/components/ReadinessExport';
import ReadinessClient from '@/app/readiness/ReadinessClient';

export const metadata: Metadata = {
  title: 'eInvoicing readiness',
  description:
    'Check an invoice against the UAE eInvoicing mandate: field-level validation with a citation to the exact ministerial requirement for every gap.',
  alternates: {
    canonical: '/readiness',
    languages: { 'en-US': '/readiness', ar: '/ar/readiness', 'x-default': '/readiness' },
  },
};

export default function ReadinessPage({ lang = 'en' }: { lang?: Lang }) {
  const t = translations[lang].readiness;
  const einvoicing = CORPUS_LIST.find(c => c.id === 'uae-einvoicing');
  // Clause texts for the cited units only, so the client bundle stays small.
  const clauses: Record<string, ReadinessClause> = {};
  for (const id of citedRequirementIds()) {
    const unit = einvoicing?.units.find(u => u.id === id);
    if (unit)
      clauses[id] = { articleRef: formatArticleRef(unit.articleRef, lang), textEn: unit.textEn };
  }

  return (
    <Page maxW="4xl" lang={lang}>
      <PageHeader eyebrow={t.eyebrow} title={t.title} maxW="64ch" lang={lang}>
        {t.lede}
      </PageHeader>
      <Reveal delay={160}>
        <ReadinessClient clauses={clauses} lang={lang} />
      </Reveal>
      {einvoicing && (
        <Box
          mt="12"
          borderWidth="1px"
          borderColor="border.default"
          bg="bg.panel"
          rounded="lg"
          p="4"
        >
          <Text fontSize="xs" color="fg.subtle">
            {lang === 'ar'
              ? (einvoicing.disclaimer.ar ?? einvoicing.disclaimer.en)
              : einvoicing.disclaimer.en}{' '}
            {t.disclaimerSuffix}
          </Text>
        </Box>
      )}
    </Page>
  );
}
