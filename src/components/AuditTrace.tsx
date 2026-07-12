import NextLink from 'next/link';
import { Box, Heading, HStack, Link, Stack, Text } from '@chakra-ui/react';
import { type AuditRun } from '@/lib/findings';

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

function buildSteps(run: AuditRun, corpusLabel: string): Step[] {
  return [
    {
      title: 'Requirements loaded',
      detail: `${run.requirementsChecked} testable units from ${corpusLabel}, each with a stable citable id.`,
    },
    {
      title: 'Source snapshot',
      detail: `${run.filesScanned.length} files handed to the model line-numbered; comments are treated as data, not instructions.`,
    },
    {
      title: 'Model audit',
      detail: `${run.model}, forced to answer through one structured tool (report_findings) so the output is data, not prose.`,
    },
    {
      title: 'Structured output',
      detail: `${run.findings.length} findings emitted as JSON, each citing the requirement id it violates with file and line.`,
    },
    {
      title: 'Schema validation',
      detail: `Every finding is parsed against the Zod findingSchema before it is trusted; a malformed finding fails the run.`,
    },
    {
      title: 'Human review',
      detail: `Findings enter the queue as proposed. None are final until a person approves or rejects them.`,
      href: '/review',
      gold: true,
    },
    {
      title: 'Cost accounted',
      detail: `${run.usage.inputTokens.toLocaleString()} in / ${run.usage.outputTokens.toLocaleString()} out tokens, $${run.usage.estimatedCostUsd} for the run.`,
    },
  ];
}

function TraceStep({ step, index, last }: { step: Step; index: number; last: boolean }) {
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
                <NextLink href={step.href}>Open the queue.</NextLink>
              </Link>
            </>
          )}
        </Text>
      </Box>
    </HStack>
  );
}

export function AuditTrace({ run, corpusLabel }: { run: AuditRun; corpusLabel: string }) {
  const steps = buildSteps(run, corpusLabel);
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
        How this run was governed
      </Heading>
      <Text fontSize="sm" color="fg.muted" mb="5">
        The pipeline that produced the findings below, traced from the run itself.
      </Text>
      <Stack gap="0">
        {steps.map((step, i) => (
          <TraceStep key={step.title} step={step} index={i} last={i === steps.length - 1} />
        ))}
      </Stack>
    </Box>
  );
}
