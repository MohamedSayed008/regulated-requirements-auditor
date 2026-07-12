import type { Metadata } from 'next';
import NextLink from 'next/link';
import { Badge, Box, Button, Grid, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { auditRunSchema } from '@/lib/findings';
import { SEVERITY_ORDER } from '@/lib/severity';
import { Page } from '@/components/ui/shell';
import { FindingCard } from '@/components/FindingCard';
import { AuditExport, type ClauseText } from '@/components/AuditExport';
import { AuditTrace } from '@/components/AuditTrace';
import { requirementById } from '@/lib/requirement-lookup';
import runJson from '@/data/audit/latest-run.json';

export const metadata: Metadata = {
  title: 'Audit',
  description:
    'A replayed code audit: a tenancy-management app checked against Dubai tenancy law, with each finding tied to the clause it violates.',
  alternates: { canonical: '/audit' },
};

const run = auditRunSchema.parse(runJson);
const findings = [...run.findings].sort(
  (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
);

// The cached /audit run replays the tenancy sample.
const CORPUS_LABEL = 'Dubai tenancy law';

// Bundle each cited clause's text so the exported report carries the real
// requirement language, not just its id.
const clauses: Record<string, ClauseText> = {};
for (const finding of run.findings) {
  const unit = requirementById(finding.requirementId);
  if (unit && !clauses[finding.requirementId]) {
    clauses[finding.requirementId] = { articleRef: unit.articleRef, textEn: unit.textEn };
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="lg" p="4">
      <Text fontFamily="heading" fontSize="2xl" color="fg.default">
        {value}
      </Text>
      <Text fontSize="xs" color="fg.subtle" mt="1">
        {label}
      </Text>
    </Box>
  );
}

export default function AuditPage() {
  return (
    <Page>
      <Stack gap="4" mb="8">
        <Text
          fontSize="sm"
          fontWeight="semibold"
          letterSpacing="0.2em"
          textTransform="uppercase"
          color="accent.fg"
        >
          Code audit
        </Text>
        <Heading fontFamily="heading" fontSize="3xl">
          The code audited against the law
        </Heading>
        <Text color="fg.muted" maxW="2xl">
          A small tenancy-management app was audited against the {run.requirementsChecked} testable
          requirement units. This page replays a real run: the model read the source and raised each
          finding below, tying code to the clause it violates. Findings are proposed, never final:
          the review queue is where a human approves or rejects them.
        </Text>
        <HStack gap="3" flexWrap="wrap">
          <Button asChild variant="outline" borderColor="border.default" size="sm">
            <NextLink href="/review">Open the review queue</NextLink>
          </Button>
          <AuditExport run={run} clauses={clauses} corpusLabel={CORPUS_LABEL} />
        </HStack>
      </Stack>

      <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap="3" mb="8">
        <Stat label="Findings raised" value={String(run.findings.length)} />
        <Stat label="Requirements checked" value={String(run.requirementsChecked)} />
        <Stat label="Files scanned" value={String(run.filesScanned.length)} />
        <Stat label="Run cost" value={`$${run.usage.estimatedCostUsd}`} />
      </Grid>

      <HStack gap="2" mb="6" flexWrap="wrap" fontSize="xs" color="fg.subtle">
        <Badge colorPalette="teal" variant="subtle">
          {run.model}
        </Badge>
        <Text>
          {run.usage.inputTokens.toLocaleString()} in / {run.usage.outputTokens.toLocaleString()}{' '}
          out tokens
        </Text>
        <Text>· target: {run.target}</Text>
      </HStack>

      <AuditTrace run={run} corpusLabel={CORPUS_LABEL} />

      <Stack gap="4">
        {findings.map(finding => (
          <FindingCard key={finding.id} finding={finding} />
        ))}
      </Stack>
    </Page>
  );
}
