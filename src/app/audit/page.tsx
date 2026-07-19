import type { Metadata } from 'next';
import { type ReactNode } from 'react';
import NextLink from 'next/link';
import { Badge, Box, Button, Grid, HStack, Stack, Text } from '@chakra-ui/react';
import { auditRunSchema } from '@/lib/findings';
import { SEVERITY_ORDER } from '@/lib/severity';
import { Page } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import { CountUp } from '@/components/ui/CountUp';
import { FindingCard } from '@/components/FindingCard';
import { AuditExport, type ClauseText } from '@/components/AuditExport';
import { AuditTrace } from '@/components/AuditTrace';
import { requirementById } from '@/lib/requirement-lookup';
import { type Lang, localePath, translations } from '@/lib/i18n';
import runJson from '@/data/audit/latest-run.json';

export const metadata: Metadata = {
  title: 'Audit',
  description:
    'A replayed code audit: a tenancy-management app checked against Dubai tenancy law, with each finding tied to the clause it violates.',
  alternates: {
    canonical: '/audit',
    languages: { 'en-US': '/audit', ar: '/ar/audit', 'x-default': '/audit' },
  },
};

const run = auditRunSchema.parse(runJson);
const findings = [...run.findings].sort(
  (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
);

// Bundle each cited clause's text so the exported report carries the real
// requirement language, not just its id.
const clauses: Record<string, ClauseText> = {};
for (const finding of run.findings) {
  const unit = requirementById(finding.requirementId);
  if (unit && !clauses[finding.requirementId]) {
    clauses[finding.requirementId] = { articleRef: unit.articleRef, textEn: unit.textEn };
  }
}

export default function AuditPage({ lang = 'en' }: { lang?: Lang }) {
  const t = translations[lang].audit;
  return (
    <Page lang={lang}>
      <PageHeader eyebrow={t.eyebrow} title={t.title} lang={lang}>
        {t.lede(run.requirementsChecked)}
      </PageHeader>

      <Reveal delay={160}>
        <HStack gap="2.5" flexWrap="wrap" mb="9">
          <Button
            asChild
            variant="outline"
            borderColor="border.default"
            size="sm"
            _hover={{ borderColor: 'accent.solid' }}
          >
            <NextLink href={localePath(lang, '/review')}>{t.openQueue}</NextLink>
          </Button>
          <AuditExport run={run} clauses={clauses} corpusLabel={t.corpusLabel} />
        </HStack>
      </Reveal>

      <Reveal delay={200}>
        <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap="3.5" mb="5">
          <Stat value={<CountUp to={run.findings.length} />} label={t.statFindings} />
          <Stat value={<CountUp to={run.requirementsChecked} />} label={t.statRequirements} />
          <Stat value={<CountUp to={run.filesScanned.length} />} label={t.statFiles} />
          <Stat value={`$${run.usage.estimatedCostUsd}`} label={t.statCost} color="law.fg" />
        </Grid>
        <HStack gap="3" mb="10" flexWrap="wrap" fontSize="xs" color="fg.subtle">
          <Badge colorPalette="teal" variant="subtle" fontFamily="heading" rounded="full">
            {run.model}
          </Badge>
          <Text>
            {t.tokens(
              run.usage.inputTokens.toLocaleString(),
              run.usage.outputTokens.toLocaleString()
            )}
          </Text>
          <Text>
            &middot; {t.target}{' '}
            <Text as="span" dir="ltr">
              {run.target}
            </Text>
          </Text>
        </HStack>
      </Reveal>

      <Reveal delay={240}>
        <Box mb="11">
          <AuditTrace run={run} corpusLabel={t.corpusLabel} lang={lang} />
        </Box>
      </Reveal>

      <Stack gap="4">
        {findings.map((finding, i) => (
          <Reveal key={finding.id} delay={Math.min(i, 4) * 60}>
            <FindingCard finding={finding} lang={lang} />
          </Reveal>
        ))}
      </Stack>
    </Page>
  );
}

function Stat({
  value,
  label,
  color = 'fg.default',
}: {
  value: ReactNode;
  label: string;
  color?: string;
}) {
  return (
    <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="xl" p="4.5">
      <Text fontFamily="heading" fontSize="2xl" color={color}>
        {value}
      </Text>
      <Text fontSize="xs" color="fg.subtle" mt="1">
        {label}
      </Text>
    </Box>
  );
}
