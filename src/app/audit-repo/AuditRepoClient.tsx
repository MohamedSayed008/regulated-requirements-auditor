'use client';

import { type FormEvent, useState } from 'react';
import { Badge, Box, Button, Grid, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { type AuditRun } from '@/lib/findings';
import { SEVERITY_ORDER } from '@/lib/severity';
import { FindingCard } from '@/components/FindingCard';

type Status = 'idle' | 'running' | 'done' | 'error';

const ERROR_COPY: Record<string, string> = {
  invalid_url: 'That does not look like a public GitHub repository URL.',
  not_found: 'Repository not found. It must be public and exist.',
  empty: 'No auditable source files were found in that repository.',
  too_large: 'That request is too large.',
  rate_limited: 'Rate limit reached. Please try again in a while.',
  upstream_rate_limited: 'The model is busy. Please try again shortly.',
  fetch_failed: 'Could not reach GitHub to fetch the repository.',
  audit_failed: 'The audit could not be completed. Please try again.',
  demo_disabled: 'The live demo is paused right now (budget cap).',
  default: 'Something went wrong. Please try again.',
};

export default function AuditRepoClient() {
  const [repoUrl, setRepoUrl] = useState('');
  const [run, setRun] = useState<AuditRun | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorKey, setErrorKey] = useState('default');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = repoUrl.trim();
    if (!url || status === 'running') return;
    setStatus('running');
    setRun(null);

    try {
      const response = await fetch('/api/audit-repo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ repoUrl: url }),
      });
      const body = await response.json().catch(() => ({ error: 'default' }));
      if (!response.ok) {
        setErrorKey(typeof body.error === 'string' ? body.error : 'default');
        setStatus('error');
        return;
      }
      setRun(body.run as AuditRun);
      setStatus('done');
    } catch {
      setErrorKey('default');
      setStatus('error');
    }
  }

  const findings = run
    ? [...run.findings].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
    : [];

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Stack direction={{ base: 'column', sm: 'row' }} gap="3">
          <Input
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            maxLength={300}
            aria-label="Public GitHub repository URL"
            bg="bg.panel"
            borderColor="border.default"
            color="fg.default"
            _placeholder={{ color: 'fg.subtle' }}
            _focus={{ borderColor: 'accent.solid' }}
            size="lg"
          />
          <Button
            type="submit"
            disabled={status === 'running' || repoUrl.trim().length === 0}
            bg="accent.solid"
            color="white"
            _hover={{ bg: 'teal.600' }}
            size="lg"
            px="6"
          >
            {status === 'running' ? 'Auditing' : 'Audit'}
          </Button>
        </Stack>
      </form>

      {status === 'running' && (
        <Text mt="6" fontSize="sm" color="fg.subtle" animation="pulse">
          Fetching the repository and auditing its code against the requirements
        </Text>
      )}

      {status === 'error' && (
        <Box
          role="alert"
          mt="6"
          borderWidth="1px"
          borderColor="red.900"
          bg="red.950"
          rounded="lg"
          px="4"
          py="3"
        >
          <Text fontSize="sm" color="red.300">
            {ERROR_COPY[errorKey] ?? ERROR_COPY.default}
          </Text>
        </Box>
      )}

      {status === 'done' && run && (
        <Stack gap="4" mt="8">
          <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap="3">
            <Stat label="Findings" value={String(run.findings.length)} />
            <Stat label="Files scanned" value={String(run.filesScanned.length)} />
            <Stat label="Requirements" value={String(run.requirementsChecked)} />
            <Stat label="Run cost" value={`$${run.usage.estimatedCostUsd}`} />
          </Grid>
          <HStack gap="2" flexWrap="wrap" fontSize="xs" color="fg.subtle">
            <Badge colorPalette="teal" variant="subtle">
              {run.model}
            </Badge>
            <Text>· target: {run.target}</Text>
          </HStack>

          {findings.length === 0 ? (
            <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="xl" p="5">
              <Text fontSize="sm" color="fg.muted">
                No applicable findings. The audited code did not conflict with any of the testable
                Dubai tenancy requirements. That is the expected result for code outside this
                domain.
              </Text>
            </Box>
          ) : (
            findings.map(finding => <FindingCard key={finding.id} finding={finding} />)
          )}
        </Stack>
      )}
    </Box>
  );
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
