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

type Status = 'idle' | 'running' | 'done' | 'error';

const ERROR_COPY: Record<string, string> = {
  invalid_json: 'That is not valid JSON. Paste the invoice as a JSON object.',
  invalid_request: 'That request shape was not recognised.',
  too_large: 'That invoice payload is too large for the demo.',
  rate_limited: 'Rate limit reached. Please try again in a while.',
  default: 'Something went wrong. Please try again.',
};

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

const QUESTIONS: QuestionSpec[] = [
  {
    key: 'format',
    label: 'How are invoices issued today?',
    options: [
      { value: 'structured', label: 'Structured data' },
      { value: 'pdf', label: 'PDF' },
      { value: 'image', label: 'Scan / image' },
      { value: 'email', label: 'Email' },
    ],
  },
  {
    key: 'aspAppointed',
    label: 'Accredited Service Provider appointed?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    key: 'storageInUae',
    label: 'Invoice data stored in the UAE?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    key: 'canIssueCreditNotes',
    label: 'Can your system issue electronic credit notes?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
];

function toProcessAnswers(raw: Record<string, string | undefined>): ProcessAnswers {
  const bool = (value: string | undefined) => (value === undefined ? undefined : value === 'yes');
  return {
    format: raw.format as ProcessAnswers['format'],
    aspAppointed: bool(raw.aspAppointed),
    storageInUae: bool(raw.storageInUae),
    canIssueCreditNotes: bool(raw.canIssueCreditNotes),
  };
}

export default function ReadinessClient({ clauses }: { clauses: Record<string, ReadinessClause> }) {
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
      setErrorText(ERROR_COPY.invalid_json);
      setStatus('error');
      return;
    }
    setStatus('running');
    setReport(null);
    try {
      const response = await fetch('/api/readiness', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ invoice, process: toProcessAnswers(answers) }),
      });
      const body = await response.json().catch(() => ({ error: 'default' }));
      if (!response.ok) {
        const key = typeof body.error === 'string' ? body.error : 'default';
        setErrorText(ERROR_COPY[key] ?? ERROR_COPY.default);
        setStatus('error');
        return;
      }
      setReport(body.report as ReadinessReport);
      setRunDate(new Date().toISOString().slice(0, 10));
      setStatus('done');
    } catch {
      setErrorText(ERROR_COPY.default);
      setStatus('error');
    }
  }

  return (
    <Stack gap="8">
      <Box>
        <HStack justify="space-between" flexWrap="wrap" gap="2" mb="2.5">
          <Text fontFamily="heading" fontSize="xs" letterSpacing="0.1em" color="fg.subtle">
            INVOICE JSON
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
              Load compliant sample
            </Button>
            <Button
              size="xs"
              variant="outline"
              borderColor="border.default"
              color="fg.muted"
              _hover={{ color: 'fg.default', borderColor: 'warn.fg' }}
              onClick={() => loadSample(GAPPY_SAMPLE)}
            >
              Load gappy sample
            </Button>
          </HStack>
        </HStack>
        <Textarea
          value={invoiceText}
          onChange={e => setInvoiceText(e.target.value)}
          placeholder='Paste an invoice as JSON, e.g. { "seller": { "name": "...", "trn": "..." }, "lines": [...] }, or load a sample.'
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
          PROCESS FACTS (OPTIONAL, UNANSWERED = NOT ASSESSED)
        </Text>
        {QUESTIONS.map(question => (
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
          Check readiness
        </Button>
      </Box>

      {status === 'error' && (
        <Box borderWidth="1px" borderColor="warn.line" bg="warn.bg" rounded="lg" px="4" py="3">
          <Text fontSize="sm" color="warn.fg">
            {errorText}
          </Text>
        </Box>
      )}

      {report && <ReportView report={report} clauses={clauses} runDate={runDate} />}
    </Stack>
  );
}

function ReportView({
  report,
  clauses,
  runDate,
}: {
  report: ReadinessReport;
  clauses: Record<string, ReadinessClause>;
  runDate: string;
}) {
  return (
    <Stack gap="6" borderTopWidth="1px" borderColor="border.default" pt="8">
      <Grid
        templateColumns={{ base: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }}
        gap="3"
      >
        <ScoreCell value={`${report.summary.readyPercent}%`} label="ready" accent="law.fg" />
        <ScoreCell value={String(report.summary.pass)} label="checks pass" accent="success.fg" />
        <ScoreCell value={String(report.summary.fail)} label="checks fail" accent="warn.fg" />
        <ScoreCell
          value={String(report.summary.notAssessed)}
          label="not assessed"
          accent="fg.subtle"
        />
      </Grid>

      {report.fixes.length > 0 && (
        <Box>
          <Text fontFamily="heading" fontSize="xs" letterSpacing="0.1em" color="fg.subtle" mb="3">
            WHAT TO FIX FIRST
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
            <CheckCard key={check.id} check={check} clause={clauses[check.requirementId]} />
          ))}
        </Stack>
      </Box>

      <ReadinessExport report={report} clauses={clauses} runDate={runDate} />
    </Stack>
  );
}

function CheckCard({
  check,
  clause,
}: {
  check: ReadinessReport['checks'][number];
  clause: ReadinessClause | undefined;
}) {
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
          <NextLink href={`/requirements#${check.requirementId}`}>
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
          Fix: {check.fix}
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
