import type { Metadata } from 'next';
import { Badge, Box, Grid, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { type CorpusReport, type SuiteResult, evalReportSetSchema } from '@/lib/eval-report';
import { Page } from '@/components/ui/shell';
import reportsJson from '@/data/evals/reports.json';

export const metadata: Metadata = {
  title: 'Evals',
  description:
    'The published eval report per corpus: groundedness, refusal correctness, injection resistance, and audit precision/recall.',
  alternates: { canonical: '/evals' },
};

const reports = evalReportSetSchema.parse(reportsJson);

function pct(passed: number, total: number): string {
  return total === 0 ? '—' : `${Math.round((passed / total) * 100)}%`;
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="lg" p="4">
      <Text fontFamily="heading" fontSize="3xl" color="fg.default">
        {value}
      </Text>
      <Text fontSize="xs" color="fg.subtle" mt="1">
        {label}
      </Text>
      {sub && (
        <Text fontSize="xs" color="fg.muted" mt="0.5">
          {sub}
        </Text>
      )}
    </Box>
  );
}

function SuiteBlock({ suite }: { suite: SuiteResult }) {
  return (
    <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="xl" p="5">
      <HStack justify="space-between" mb="3" flexWrap="wrap">
        <Text fontWeight="medium" color="fg.default">
          {suite.name}
        </Text>
        <Badge colorPalette={suite.passed === suite.total ? 'green' : 'orange'} variant="subtle">
          {suite.passed}/{suite.total} passed
        </Badge>
      </HStack>
      <Stack gap="1.5">
        {suite.cases.map(c => (
          <HStack key={c.id} gap="3" fontSize="xs" flexWrap="wrap">
            <Badge colorPalette={c.pass ? 'green' : 'red'} variant="subtle">
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

function CorpusReportSection({ entry }: { entry: CorpusReport }) {
  const { auditScore, suites, usage } = entry.report;
  return (
    <Box as="section" mb="14">
      <Heading as="h2" fontFamily="heading" fontSize="2xl" mb="1">
        {entry.corpusName}
      </Heading>
      <HStack gap="2" mb="4" flexWrap="wrap" fontSize="xs" color="fg.subtle">
        <Badge colorPalette="teal" variant="subtle">
          {entry.report.model}
        </Badge>
        <Text>· generated {new Date(entry.report.ranAt).toISOString().slice(0, 10)}</Text>
        <Text>· ${usage.estimatedCostUsd}</Text>
      </HStack>

      <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }} gap="3" mb="6">
        {suites.map(s => (
          <Metric
            key={s.name}
            label={s.name}
            value={pct(s.passed, s.total)}
            sub={`${s.passed}/${s.total}`}
          />
        ))}
        <Metric
          label="Audit precision / recall"
          value={`${auditScore.precision.toFixed(2)} / ${auditScore.recall.toFixed(2)}`}
          sub={`${auditScore.detectedViolations}/${auditScore.seededViolations} seeded, ${auditScore.falsePositives} FP`}
        />
      </Grid>

      <Stack gap="4">
        {suites.map(s => (
          <SuiteBlock key={s.name} suite={s} />
        ))}
      </Stack>
    </Box>
  );
}

export default function EvalsPage() {
  const pending = reports.length === 0;
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
          Published evals
        </Text>
        <Heading fontFamily="serif" fontWeight="500" fontSize="3xl">
          How reliable is it?
        </Heading>
        <Text color="fg.muted" maxW="2xl">
          Every claim this demo makes is measured here, per corpus. Graders are programmatic, so the
          numbers are reproducible: groundedness checks that answers cite the right requirement,
          refusal checks that out-of-corpus questions are declined, injection resistance checks that
          neither a crafted question nor a hostile code comment can steer the model, and the audit
          score is precision and recall against a seeded ground truth. The misses are shown too.
        </Text>
        {pending && (
          <Box borderWidth="1px" borderColor="orange.900" bg="orange.950" rounded="lg" p="4">
            <Text fontSize="sm" color="orange.300">
              The eval reports have not been generated yet.
            </Text>
          </Box>
        )}
      </Stack>

      {reports.map(entry => (
        <CorpusReportSection key={entry.corpusId} entry={entry} />
      ))}
    </Page>
  );
}
