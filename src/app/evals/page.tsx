import type { Metadata } from 'next';
import { Badge, Box, Grid, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { type CorpusReport, type SuiteResult, evalReportSetSchema } from '@/lib/eval-report';
import { Page } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import { MetricBar } from '@/components/ui/MetricBar';
import reportsJson from '@/data/evals/reports.json';

export const metadata: Metadata = {
  title: 'Evals',
  description:
    'The published eval report per corpus: groundedness, refusal correctness, injection resistance, and audit precision/recall.',
  alternates: { canonical: '/evals' },
};

const reports = evalReportSetSchema.parse(reportsJson);

export default function EvalsPage() {
  return (
    <Page>
      <PageHeader eyebrow="Published evals" title="How reliable is it?" maxW="66ch">
        Every claim this demo makes is measured here, per corpus. Graders are programmatic, so the
        numbers are reproducible: groundedness, refusal correctness, injection resistance, and audit
        precision/recall against a seeded ground truth. The misses are shown too.
      </PageHeader>

      {reports.length === 0 && (
        <Box borderWidth="1px" borderColor="law.line" bg="law.muted" rounded="lg" p="4">
          <Text fontSize="sm" color="law.fg">
            The eval reports have not been generated yet.
          </Text>
        </Box>
      )}

      {reports.map(entry => (
        <CorpusReportSection key={entry.corpusId} entry={entry} />
      ))}
    </Page>
  );
}

function pct(passed: number, total: number): number {
  return total === 0 ? 0 : passed / total;
}

function CorpusReportSection({ entry }: { entry: CorpusReport }) {
  const { auditScore, suites, usage } = entry.report;
  return (
    <Box as="section" mb="16">
      <Reveal>
        <HStack gap="3" align="baseline" flexWrap="wrap" mb="5">
          <Heading as="h2" fontFamily="heading" fontSize="xl">
            {entry.corpusName}
          </Heading>
          <Badge colorPalette="teal" variant="subtle" fontFamily="heading" rounded="full">
            {entry.report.model}
          </Badge>
          <Text fontSize="xs" color="fg.subtle">
            generated {new Date(entry.report.ranAt).toISOString().slice(0, 10)} &middot; $
            {usage.estimatedCostUsd}
          </Text>
        </HStack>
      </Reveal>

      <Reveal delay={60}>
        <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap="3.5" mb="6">
          {suites.map(s => (
            <MetricCard
              key={s.name}
              value={`${Math.round(pct(s.passed, s.total) * 100)}%`}
              label={`${s.name} · ${s.passed}/${s.total}`}
              bar={pct(s.passed, s.total)}
              tone="teal"
            />
          ))}
          <MetricCard
            value={`${auditScore.precision.toFixed(2)} / ${auditScore.recall.toFixed(2)}`}
            label={`Precision / recall · ${auditScore.detectedViolations}/${auditScore.seededViolations} seeded, ${auditScore.falsePositives} FP`}
            bar={auditScore.precision}
            tone="gold"
          />
        </Grid>
      </Reveal>

      {auditScore.falsePositives > 0 && (
        <Reveal delay={90}>
          <Box
            borderWidth="1px"
            borderColor="law.line"
            bg="law.muted"
            rounded="xl"
            px="5"
            py="3.5"
            mb="6"
          >
            <Text fontSize="sm" color="law.fg" lineHeight="1.6">
              The false positive here is a legitimate extra finding raised on a genuinely
              non-compliant file: scored honestly rather than suppressed.
            </Text>
          </Box>
        </Reveal>
      )}

      <Stack gap="4">
        {suites.map((s, i) => (
          <Reveal key={s.name} delay={Math.min(i, 3) * 60}>
            <SuiteBlock suite={s} />
          </Reveal>
        ))}
      </Stack>
    </Box>
  );
}

function MetricCard({
  value,
  label,
  bar,
  tone,
}: {
  value: string;
  label: string;
  bar: number;
  tone: 'teal' | 'gold';
}) {
  return (
    <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="xl" p="4.5">
      <Text fontFamily="heading" fontSize="2xl" color={tone === 'gold' ? 'law.fg' : 'fg.default'}>
        {value}
      </Text>
      <Text fontSize="xs" color="fg.subtle" mt="0.5" mb="3">
        {label}
      </Text>
      <MetricBar value={bar} tone={tone} />
    </Box>
  );
}

function SuiteBlock({ suite }: { suite: SuiteResult }) {
  return (
    <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="2xl" p="5">
      <HStack justify="space-between" mb="3.5" flexWrap="wrap">
        <Text fontWeight="500" color="fg.default">
          {suite.name}
        </Text>
        <Badge
          colorPalette={suite.passed === suite.total ? 'green' : 'orange'}
          variant="subtle"
          rounded="full"
        >
          {suite.passed}/{suite.total} passed
        </Badge>
      </HStack>
      <Stack gap="2">
        {suite.cases.map(c => (
          <HStack key={c.id} gap="3" fontSize="xs" flexWrap="wrap">
            <Badge colorPalette={c.pass ? 'green' : 'red'} variant="subtle" rounded="full">
              {c.pass ? 'pass' : 'fail'}
            </Badge>
            <Text fontFamily="heading" color="fg.subtle">
              {c.id}
            </Text>
            <Text color="fg.muted">{c.detail}</Text>
          </HStack>
        ))}
      </Stack>
    </Box>
  );
}
