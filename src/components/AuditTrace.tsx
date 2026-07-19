import NextLink from 'next/link';
import { Box, Heading, HStack, Link, Stack, Text } from '@chakra-ui/react';
import { type AuditRun } from '@/lib/findings';
import { type Lang, localePath, translations } from '@/lib/i18n';

/**
 * A static trace of how a cached audit run was produced and governed: corpus in,
 * source in, one forced-tool model call, schema validation, human review, cost.
 * Every value is read from the run itself, so the trace cannot drift from the
 * findings it explains. Server component, no interactivity.
 */

interface Step {
  title: string;
  detail: string;
  href?: string;
  /** The human step renders gold: it is the law side of the pipeline. */
  gold?: boolean;
}

function buildSteps(run: AuditRun, corpusLabel: string, lang: Lang): Step[] {
  const s = translations[lang].audit.trace.steps;
  return [
    s.requirements(run.requirementsChecked, corpusLabel),
    s.source(run.filesScanned.length),
    s.model(run.model),
    s.structured(run.findings.length),
    s.schema(),
    { ...s.review(), href: localePath(lang, '/review'), gold: true },
    s.cost(
      run.usage.inputTokens.toLocaleString(),
      run.usage.outputTokens.toLocaleString(),
      run.usage.estimatedCostUsd
    ),
  ];
}

function TraceStep({
  step,
  index,
  last,
  openQueue,
}: {
  step: Step;
  index: number;
  last: boolean;
  openQueue: string;
}) {
  return (
    <HStack gap="4" align="stretch">
      <Stack gap="0" align="center" flexShrink="0">
        <Box
          w="7"
          h="7"
          rounded="full"
          borderWidth="1px"
          borderColor={step.gold ? 'law.solid' : 'accent.solid'}
          color={step.gold ? 'law.fg' : 'accent.fg'}
          bg="bg.canvas"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontFamily="heading"
          fontSize="xs"
        >
          {index + 1}
        </Box>
        {!last && <Box flex="1" w="1px" bg="border.default" mt="1" minH="6" />}
      </Stack>
      <Box pb={last ? '0' : '5'}>
        <Text fontSize="sm" fontWeight="medium" color="fg.default">
          {step.title}
        </Text>
        <Text fontSize="sm" color="fg.muted" mt="0.5">
          {step.detail}
          {step.href && (
            <>
              {' '}
              <Link asChild color="accent.fg">
                <NextLink href={step.href}>{openQueue}</NextLink>
              </Link>
            </>
          )}
        </Text>
      </Box>
    </HStack>
  );
}

export function AuditTrace({
  run,
  corpusLabel,
  lang = 'en',
}: {
  run: AuditRun;
  corpusLabel: string;
  lang?: Lang;
}) {
  const t = translations[lang].audit.trace;
  const steps = buildSteps(run, corpusLabel, lang);
  return (
    <Box
      as="section"
      aria-labelledby="trace-heading"
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.panel"
      rounded="xl"
      p="6"
      mb="8"
    >
      <Heading as="h2" id="trace-heading" fontFamily="heading" fontSize="lg" mb="1">
        {t.heading}
      </Heading>
      <Text fontSize="sm" color="fg.muted" mb="5">
        {t.sub}
      </Text>
      <Stack gap="0">
        {steps.map((step, i) => (
          <TraceStep
            key={step.title}
            step={step}
            index={i}
            last={i === steps.length - 1}
            openQueue={t.openQueue}
          />
        ))}
      </Stack>
    </Box>
  );
}
