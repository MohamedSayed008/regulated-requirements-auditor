import type { Metadata } from 'next';
import { Badge, Box, Grid, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { type CorpusReport, type SuiteResult, evalReportSetSchema } from '@/lib/eval-report';
import { Page } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import { MetricBar } from '@/components/ui/MetricBar';
import { type Lang, translations } from '@/lib/i18n';
import { formatEvalDetail, formatSuiteName } from '@/lib/i18n-data';
import { CORPUS_LIST } from '@/lib/corpora';
import reportsJson from '@/data/evals/reports.json';

export const metadata: Metadata = {
  title: 'Evals',
  description:
    'The published eval report per corpus: groundedness, refusal correctness, injection resistance, and audit precision/recall.',
  alternates: {
    canonical: '/evals',
    languages: { 'en-US': '/evals', ar: '/ar/evals', 'x-default': '/evals' },
  },
};

const reports = evalReportSetSchema.parse(reportsJson);

export default function EvalsPage({ lang = 'en' }: { lang?: Lang }) {
  const t = translations[lang].evals;
  return (
    <Page lang={lang}>
      <PageHeader eyebrow={t.eyebrow} title={t.title} maxW="66ch" lang={lang}>
        {t.lede}
      </PageHeader>

      {reports.length === 0 && (
        <Box borderWidth="1px" borderColor="law.line" bg="law.muted" rounded="lg" p="4">
          <Text fontSize="sm" color="law.fg">
            {t.empty}
          </Text>
        </Box>
      )}

      {reports.map(entry => (
        <CorpusReportSection key={entry.corpusId} entry={entry} lang={lang} />
      ))}
    </Page>
  );
}

function pct(passed: number, total: number): number {
  return total === 0 ? 0 : passed / total;
}

function CorpusReportSection({ entry, lang }: { entry: CorpusReport; lang: Lang }) {
  const t = translations[lang].evals;
  const { auditScore, suites, usage } = entry.report;
  return (
    <Box as="section" mb="16">
      <Reveal>
        <HStack gap="3" align="baseline" flexWrap="wrap" mb="5">
          <Heading as="h2" fontFamily="heading" fontSize="xl">
            {lang === 'ar'
              ? (CORPUS_LIST.find(c => c.id === entry.corpusId)?.nameAr ?? entry.corpusName)
              : entry.corpusName}
          </Heading>
          <Badge colorPalette="teal" variant="subtle" fontFamily="heading" rounded="full">
            {entry.report.model}
          </Badge>
          <Text fontSize="xs" color="fg.subtle">
            {t.generated} {new Date(entry.report.ranAt).toISOString().slice(0, 10)} &middot; $
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
              label={t.suiteLabel(formatSuiteName(s.name, lang), s.passed, s.total)}
              bar={pct(s.passed, s.total)}
              tone="teal"
            />
          ))}
          <MetricCard
            value={t.precisionRecall(auditScore.precision.toFixed(2), auditScore.recall.toFixed(2))}
            label={t.precisionLabel(
              auditScore.detectedViolations,
              auditScore.seededViolations,
              auditScore.falsePositives
            )}
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
              {t.fpNote}
            </Text>
          </Box>
        </Reveal>
      )}

      <Stack gap="4">
        {suites.map((s, i) => (
          <Reveal key={s.name} delay={Math.min(i, 3) * 60}>
            <SuiteBlock suite={s} lang={lang} />
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

function SuiteBlock({ suite, lang }: { suite: SuiteResult; lang: Lang }) {
  const t = translations[lang].evals;
  return (
    <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="2xl" p="5">
      <HStack justify="space-between" mb="3.5" flexWrap="wrap">
        <Text fontWeight="500" color="fg.default">
          {formatSuiteName(suite.name, lang)}
        </Text>
        <Badge
          colorPalette={suite.passed === suite.total ? 'green' : 'orange'}
          variant="subtle"
          rounded="full"
        >
          {t.passedBadge(suite.passed, suite.total)}
        </Badge>
      </HStack>
      <Stack gap="2">
        {suite.cases.map(c => (
          <HStack key={c.id} gap="3" fontSize="xs" flexWrap="wrap">
            <Badge colorPalette={c.pass ? 'green' : 'red'} variant="subtle" rounded="full">
              {c.pass ? t.casePass : t.caseFail}
            </Badge>
            <Text fontFamily="heading" color="fg.subtle">
              {c.id}
            </Text>
            <Text color="fg.muted">{formatEvalDetail(c.detail, lang)}</Text>
          </HStack>
        ))}
      </Stack>
    </Box>
  );
}
