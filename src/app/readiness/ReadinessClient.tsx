'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import { Badge, Box, Button, Grid, HStack, Stack, Text, Textarea } from '@chakra-ui/react';
import {
  type CheckStatus,
  type ProcessAnswers,
  type ReadinessReport,
  type ReadinessSeverity,
} from '@/lib/readiness';
import { GAPPY_SAMPLE, PASSING_SAMPLE } from '@/lib/readiness-samples';
import { ReadinessExport, type ReadinessClause } from '@/components/ReadinessExport';
import { type Lang, localePath, translations } from '@/lib/i18n';

type Status = 'idle' | 'running' | 'done' | 'error';

const STATUS_PALETTE: Record<CheckStatus, string> = {
  pass: 'green',
  fail: 'red',
  not_assessed: 'gray',
};

const STATUS_GLYPH: Record<CheckStatus, string> = {
  pass: '✓',
  fail: '✗',
  not_assessed: '—',
};

const SEVERITY_PALETTE: Record<ReadinessSeverity, string> = {
  critical: 'red',
  high: 'orange',
  medium: 'yellow',
};

interface QuestionSpec {
  key: 'format' | 'aspAppointed' | 'storageInUae' | 'canIssueCreditNotes';
  label: string;
  options: { value: string; label: string }[];
}

function buildQuestions(lang: Lang): QuestionSpec[] {
  const q = translations[lang].readiness.questions;
  const yesNo = [
    { value: 'yes', label: q.yes },
    { value: 'no', label: q.no },
  ];
  return [
    {
      key: 'format',
      label: q.format,
      options: ['structured', 'pdf', 'image', 'email'].map(value => ({
        value,
        label: q.formatOptions[value],
      })),
    },
    { key: 'aspAppointed', label: q.aspAppointed, options: yesNo },
    { key: 'storageInUae', label: q.storageInUae, options: yesNo },
    { key: 'canIssueCreditNotes', label: q.canIssueCreditNotes, options: yesNo },
  ];
}

function toProcessAnswers(raw: Record<string, string | undefined>): ProcessAnswers {
  const bool = (value: string | undefined) => (value === undefined ? undefined : value === 'yes');
  return {
    format: raw.format as ProcessAnswers['format'],
    aspAppointed: bool(raw.aspAppointed),
    storageInUae: bool(raw.storageInUae),
    canIssueCreditNotes: bool(raw.canIssueCreditNotes),
  };
}

export default function ReadinessClient({
  clauses,
  lang = 'en',
}: {
  clauses: Record<string, ReadinessClause>;
  lang?: Lang;
}) {
  const t = translations[lang].readiness;
  const questions = buildQuestions(lang);
  const [invoiceText, setInvoiceText] = useState('');
  const [answers, setAnswers] = useState<Record<string, string | undefined>>({});
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [runDate, setRunDate] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorText, setErrorText] = useState('');

  function loadSample(sample: unknown) {
    setInvoiceText(JSON.stringify(sample, null, 2));
    setReport(null);
    setStatus('idle');
  }

  async function run() {
    if (status === 'running') return;
    let invoice: unknown;
    try {
      invoice = JSON.parse(invoiceText);
    } catch {
      setErrorText(t.errors.invalid_json);
      setStatus('error');
      return;
    }
    setStatus('running');
    setReport(null);
    try {
      const response = await fetch('/api/readiness', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ invoice, process: toProcessAnswers(answers), lang }),
      });
      const body = await response.json().catch(() => ({ error: 'default' }));
      if (!response.ok) {
        const key = typeof body.error === 'string' ? body.error : 'default';
        setErrorText(t.errors[key] ?? t.errors.default);
        setStatus('error');
        return;
      }
      setReport(body.report as ReadinessReport);
      setRunDate(new Date().toISOString().slice(0, 10));
      setStatus('done');
    } catch {
      setErrorText(t.errors.default);
      setStatus('error');
    }
  }

  return (
    <Stack gap="8">
      <Box>
        <HStack justify="space-between" flexWrap="wrap" gap="2" mb="2.5">
          <Text fontFamily="heading" fontSize="xs" letterSpacing="0.1em" color="fg.subtle">
            {t.invoiceLabel}
          </Text>
          <HStack gap="2">
            <Button
              size="xs"
              variant="outline"
              borderColor="border.default"
              color="fg.muted"
              _hover={{ color: 'fg.default', borderColor: 'accent.solid' }}
              onClick={() => loadSample(PASSING_SAMPLE)}
            >
              {t.loadPassing}
            </Button>
            <Button
              size="xs"
              variant="outline"
              borderColor="border.default"
              color="fg.muted"
              _hover={{ color: 'fg.default', borderColor: 'warn.fg' }}
              onClick={() => loadSample(GAPPY_SAMPLE)}
            >
              {t.loadGappy}
            </Button>
          </HStack>
        </HStack>
        <Textarea
          value={invoiceText}
          onChange={e => setInvoiceText(e.target.value)}
          placeholder={t.placeholder}
          dir="ltr"
          fontFamily="heading"
          fontSize="xs"
          minH="72"
          bg="bg.panel"
          borderColor="border.default"
          color="fg.default"
          _placeholder={{ color: 'fg.subtle' }}
        />
      </Box>

      <Stack gap="3.5">
        <Text fontFamily="heading" fontSize="xs" letterSpacing="0.1em" color="fg.subtle">
          {t.processLabel}
        </Text>
        {questions.map(question => (
          <HStack key={question.key} gap="3" flexWrap="wrap">
            <Text fontSize="sm" color="fg.muted" minW="72">
              {question.label}
            </Text>
            <HStack gap="1.5">
              {question.options.map(option => {
                const selected = answers[question.key] === option.value;
                return (
                  <Button
                    key={option.value}
                    size="xs"
                    variant="outline"
                    rounded="full"
                    borderColor={selected ? 'accent.solid' : 'border.default'}
                    bg={selected ? 'accent.muted' : 'transparent'}
                    color={selected ? 'accent.fg' : 'fg.muted'}
                    _hover={{ color: 'fg.default', borderColor: 'accent.solid' }}
                    onClick={() =>
                      setAnswers(prev => ({
                        ...prev,
                        [question.key]: selected ? undefined : option.value,
                      }))
                    }
                  >
                    {option.label}
                  </Button>
                );
              })}
            </HStack>
          </HStack>
        ))}
      </Stack>

      <Box>
        <Button
          onClick={() => void run()}
          loading={status === 'running'}
          disabled={invoiceText.trim().length === 0}
          bg="law.fg"
          color="bg.canvas"
          fontWeight="600"
          _hover={{ bg: 'law.solid' }}
        >
          {t.submit}
        </Button>
      </Box>

      {status === 'error' && (
        <Box borderWidth="1px" borderColor="warn.line" bg="warn.bg" rounded="lg" px="4" py="3">
          <Text fontSize="sm" color="warn.fg">
            {errorText}
          </Text>
        </Box>
      )}

      {report && <ReportView report={report} clauses={clauses} runDate={runDate} lang={lang} />}
    </Stack>
  );
}

function ReportView({
  report,
  clauses,
  runDate,
  lang,
}: {
  report: ReadinessReport;
  clauses: Record<string, ReadinessClause>;
  runDate: string;
  lang: Lang;
}) {
  const t = translations[lang].readiness;
  return (
    <Stack gap="6" borderTopWidth="1px" borderColor="border.default" pt="8">
      <Grid
        templateColumns={{ base: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }}
        gap="3"
      >
        <ScoreCell value={`${report.summary.readyPercent}%`} label={t.scoreReady} accent="law.fg" />
        <ScoreCell value={String(report.summary.pass)} label={t.scorePass} accent="success.fg" />
        <ScoreCell value={String(report.summary.fail)} label={t.scoreFail} accent="warn.fg" />
        <ScoreCell
          value={String(report.summary.notAssessed)}
          label={t.scoreNotAssessed}
          accent="fg.subtle"
        />
      </Grid>

      {report.fixes.length > 0 && (
        <Box>
          <Text fontFamily="heading" fontSize="xs" letterSpacing="0.1em" color="fg.subtle" mb="3">
            {t.fixFirst}
          </Text>
          <Stack gap="2.5">
            {report.fixes.map((fix, index) => (
              <HStack key={fix.id} gap="3" align="start">
                <Text fontFamily="heading" fontSize="sm" color="law.fg" flexShrink="0">
                  {index + 1}.
                </Text>
                <Box>
                  <HStack gap="2" flexWrap="wrap">
                    <Text fontSize="sm" fontWeight="medium" color="fg.default">
                      {fix.label}
                    </Text>
                    <Badge
                      colorPalette={SEVERITY_PALETTE[fix.severity]}
                      variant="subtle"
                      rounded="full"
                    >
                      {fix.severity}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="fg.muted" mt="0.5">
                    {fix.fix}
                  </Text>
                </Box>
              </HStack>
            ))}
          </Stack>
        </Box>
      )}

      <Box>
        <Text fontFamily="heading" fontSize="xs" letterSpacing="0.1em" color="fg.subtle" mb="3">
          ALL CHECKS
        </Text>
        <Stack gap="3">
          {report.checks.map(check => (
            <CheckCard
              key={check.id}
              check={check}
              clause={clauses[check.requirementId]}
              lang={lang}
            />
          ))}
        </Stack>
      </Box>

      <ReadinessExport report={report} clauses={clauses} runDate={runDate} lang={lang} />
    </Stack>
  );
}

function CheckCard({
  check,
  clause,
  lang,
}: {
  check: ReadinessReport['checks'][number];
  clause: ReadinessClause | undefined;
  lang: Lang;
}) {
  const t = translations[lang].readiness;
  const failed = check.status === 'fail';
  return (
    <Box
      borderWidth="1px"
      borderColor="border.default"
      borderStartWidth="3px"
      borderStartColor={
        failed ? 'warn.fg' : check.status === 'pass' ? 'success.line' : 'border.default'
      }
      bg="bg.panel"
      rounded="xl"
      p="4"
    >
      <HStack gap="2.5" flexWrap="wrap">
        <Badge colorPalette={STATUS_PALETTE[check.status]} variant="subtle" rounded="full">
          {STATUS_GLYPH[check.status]}{' '}
          {check.status === 'not_assessed' ? 'not assessed' : check.status}
        </Badge>
        <Text fontSize="sm" fontWeight="medium" color="fg.default">
          {check.label}
        </Text>
        <Box
          asChild
          fontFamily="heading"
          fontSize="xs"
          color="accent.fg"
          _hover={{ textDecoration: 'underline' }}
        >
          <NextLink href={`${localePath(lang, '/requirements')}#${check.requirementId}`}>
            {check.requirementId}
            {clause ? ` · ${clause.articleRef}` : ''}
          </NextLink>
        </Box>
      </HStack>
      <Text mt="2" fontSize="sm" color="fg.muted">
        {check.detail}
      </Text>
      {failed && (
        <Text mt="1.5" fontSize="sm" color="warn.fg">
          {t.fixPrefix} {check.fix}
        </Text>
      )}
    </Box>
  );
}

function ScoreCell({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="xl" p="4">
      <Text fontFamily="heading" fontSize="2xl" color={accent}>
        {value}
      </Text>
      <Text fontSize="xs" color="fg.subtle" mt="0.5">
        {label}
      </Text>
    </Box>
  );
}
