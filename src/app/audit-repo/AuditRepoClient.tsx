'use client';

import { type FormEvent, useState } from 'react';
import { Badge, Box, Button, Grid, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { type AuditRun } from '@/lib/findings';
import { SEVERITY_ORDER } from '@/lib/severity';
import { FindingCard } from '@/components/FindingCard';
import { type CorpusOption, CorpusToggle } from '@/components/CorpusToggle';
import { type Lang, translations } from '@/lib/i18n';

type Status = 'idle' | 'running' | 'done' | 'error';

export default function AuditRepoClient({
  corpusOptions,
  defaultCorpusId,
  lang = 'en',
}: {
  corpusOptions: CorpusOption[];
  defaultCorpusId: string;
  lang?: Lang;
}) {
  const t = translations[lang].auditRepo;
  const tCorpus = translations[lang].requirements.corpusLabel;
  const [repoUrl, setRepoUrl] = useState('');
  const [corpusId, setCorpusId] = useState(defaultCorpusId);
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
        body: JSON.stringify({ repoUrl: url, corpusId, lang }),
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
      {corpusOptions.length > 1 && (
        <Box mb="4">
          <CorpusToggle
            options={corpusOptions}
            value={corpusId}
            onChange={setCorpusId}
            label={tCorpus}
          />
        </Box>
      )}
      <form onSubmit={handleSubmit}>
        <Stack
          direction={{ base: 'column', sm: 'row' }}
          align={{ base: 'stretch', sm: 'center' }}
          gap="2.5"
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border.default"
          rounded="xl"
          p="2"
          ps={{ base: '2', sm: '4' }}
          transition="border-color 0.25s"
          _focusWithin={{ borderColor: 'accent.solid' }}
        >
          <Input
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            placeholder={t.placeholder}
            dir="ltr"
            maxLength={300}
            aria-label={t.inputAria}
            variant="outline"
            border="none"
            bg="transparent"
            color="fg.default"
            _placeholder={{ color: 'fg.subtle' }}
            _focus={{ outline: 'none', boxShadow: 'none' }}
            size="lg"
            flex="1"
            px={{ base: '3', sm: '0' }}
          />
          <Button
            type="submit"
            disabled={status === 'running' || repoUrl.trim().length === 0}
            bg="accent.solid"
            color="white"
            fontWeight="600"
            _hover={{ bg: 'teal.600' }}
            size="lg"
            px="6"
            rounded="lg"
          >
            {status === 'running' ? t.submitting : t.submit}
          </Button>
        </Stack>
      </form>

      {status === 'running' && (
        <HStack
          mt="8"
          gap="2.5"
          borderWidth="1px"
          borderColor="border.default"
          bg="bg.panel"
          rounded="xl"
          p="5"
        >
          <Box
            w="1.5"
            h="1.5"
            rounded="full"
            bg="accent.fg"
            animation="pulseDot 1.2s infinite"
            _motionReduce={{ animation: 'none' }}
          />
          <Text fontSize="sm" color="fg.muted">
            {t.running}
          </Text>
        </HStack>
      )}

      {status === 'error' && (
        <Box
          role="alert"
          mt="8"
          borderWidth="1px"
          borderColor="warn.line"
          bg="warn.bg"
          rounded="xl"
          px="5"
          py="4"
        >
          <Text fontSize="sm" color="warn.fg">
            {t.errors[errorKey] ?? t.errors.default}
          </Text>
        </Box>
      )}

      {status === 'done' && run && (
        <Stack gap="4" mt="8">
          <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap="3">
            <Stat label={t.statFindings} value={String(run.findings.length)} />
            <Stat label={t.statFiles} value={String(run.filesScanned.length)} />
            <Stat label={t.statRequirements} value={String(run.requirementsChecked)} />
            <Stat label={t.statCost} value={`$${run.usage.estimatedCostUsd}`} />
          </Grid>
          <HStack gap="2" flexWrap="wrap" fontSize="xs" color="fg.subtle">
            <Badge colorPalette="teal" variant="subtle">
              {run.model}
            </Badge>
            <Text>
              · {t.target}{' '}
              <Text as="span" dir="ltr">
                {run.target}
              </Text>
            </Text>
          </HStack>

          {findings.length === 0 ? (
            <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="xl" p="5">
              <Text fontSize="sm" color="fg.muted">
                {t.noFindings}
              </Text>
            </Box>
          ) : (
            findings.map(finding => <FindingCard key={finding.id} finding={finding} lang={lang} />)
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
