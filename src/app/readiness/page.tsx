import type { Metadata } from 'next';
import { Box, Text } from '@chakra-ui/react';
import { Page } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import { CORPUS_LIST } from '@/lib/corpora';
import { citedRequirementIds } from '@/lib/readiness';
import { type ReadinessClause } from '@/components/ReadinessExport';
import ReadinessClient from '@/app/readiness/ReadinessClient';

export const metadata: Metadata = {
  title: 'eInvoicing readiness',
  description:
    'Check an invoice against the UAE eInvoicing mandate: field-level validation with a citation to the exact ministerial requirement for every gap.',
  alternates: { canonical: '/readiness' },
};

export default function ReadinessPage() {
  const einvoicing = CORPUS_LIST.find(c => c.id === 'uae-einvoicing');
  // Clause texts for the cited units only, so the client bundle stays small.
  const clauses: Record<string, ReadinessClause> = {};
  for (const id of citedRequirementIds()) {
    const unit = einvoicing?.units.find(u => u.id === id);
    if (unit) clauses[id] = { articleRef: unit.articleRef, textEn: unit.textEn };
  }

  return (
    <Page maxW="4xl">
      <PageHeader eyebrow="Are you ready?" title="UAE eInvoicing readiness check" maxW="64ch">
        Paste a sample invoice as JSON and answer four process questions. Every check is
        deterministic and cites the exact ministerial requirement it validates, so each gap comes
        with the clause to read and a concrete fix. Nothing you paste is sent to a model.
      </PageHeader>
      <Reveal delay={160}>
        <ReadinessClient clauses={clauses} />
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
            {einvoicing.disclaimer.en} This checker is a demonstration, not tax advice; the
            authoritative field list is the Ministry of Finance data dictionary.
          </Text>
        </Box>
      )}
    </Page>
  );
}
