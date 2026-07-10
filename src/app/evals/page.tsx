import type { Metadata } from 'next';
import { Badge, Box, Grid, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { type SuiteResult, evalReportSchema } from '@/lib/eval-report';
import { Page } from '@/components/ui/shell';
import reportJson from '@/data/evals/report.json';

export const metadata: Metadata = {
  title: 'Evals: Mizan',
  description:
    'The published eval report: groundedness, refusal correctness, injection resistance, and audit precision/recall.',
};

const report = evalReportSchema.parse(reportJson);
const pending = report.model === 'pending';

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

export default function EvalsPage() {
  const { auditScore, suites, usage } = report;
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
        <Heading fontFamily="heading" fontSize="3xl">
          How reliable is it?
        </Heading>
        <Text color="fg.muted" maxW="2xl">
          Every claim this demo makes is measured here. Graders are programmatic, so the numbers are
          reproducible: groundedness checks that answers cite the right clause, refusal checks that
          out-of-corpus questions are declined, injection resistance checks that neither a crafted
          question nor a hostile code comment can steer the model, and the audit score is precision
          and recall against a seeded ground truth. The misses are shown too.
        </Text>
        {pending && (
          <Box borderWidth="1px" borderColor="orange.900" bg="orange.950" rounded="lg" p="4">
            <Text fontSize="sm" color="orange.300">
              The eval report has not been generated yet. Run the harness to populate this page.
            </Text>
          </Box>
        )}
      </Stack>

      {!pending && (
        <>
          <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap="3" mb="8">
            {suites.map(s => (
              <Metric
                key={s.name}
                label={s.name}
                value={pct(s.passed, s.total)}
                sub={`${s.passed}/${s.total}`}
              />
            ))}
          </Grid>

          <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap="3" mb="8">
            <Metric
              label="Audit precision"
              value={auditScore.precision.toFixed(2)}
              sub={`${auditScore.truePositives} true / ${auditScore.falsePositives} false`}
            />
            <Metric
              label="Audit recall"
              value={auditScore.recall.toFixed(2)}
              sub={`${auditScore.detectedViolations}/${auditScore.seededViolations} seeded`}
            />
            <Metric label="Eval cost" value={`$${usage.estimatedCostUsd}`} />
            <Metric
              label="Tokens"
              value={`${Math.round((usage.inputTokens + usage.outputTokens) / 1000)}k`}
              sub={`${usage.inputTokens.toLocaleString()} in / ${usage.outputTokens.toLocaleString()} out`}
            />
          </Grid>

          <HStack gap="2" mb="6" flexWrap="wrap" fontSize="xs" color="fg.subtle">
            <Badge colorPalette="teal" variant="subtle">
              {report.model}
            </Badge>
            <Text>· generated {new Date(report.ranAt).toISOString().slice(0, 10)}</Text>
          </HStack>

          <Stack gap="4">
            {suites.map(s => (
              <SuiteBlock key={s.name} suite={s} />
            ))}
          </Stack>
        </>
      )}
    </Page>
  );
}
