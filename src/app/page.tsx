import { type ReactNode } from 'react';
import NextLink from 'next/link';
import { Badge, Box, Button, Grid, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { Page } from '@/components/ui/shell';
import { MizanMark } from '@/components/icons/MizanMark';
import { evalReportSetSchema } from '@/lib/eval-report';
import reportsJson from '@/data/evals/reports.json';

const reports = evalReportSetSchema.parse(reportsJson);
const evalPass = reports.reduce((a, r) => a + r.report.suites.reduce((s, x) => s + x.passed, 0), 0);
const evalTotal = reports.reduce((a, r) => a + r.report.suites.reduce((s, x) => s + x.total, 0), 0);
const minPrecision = reports.length
  ? Math.min(...reports.map(r => r.report.auditScore.precision))
  : 0;
const minRecall = reports.length ? Math.min(...reports.map(r => r.report.auditScore.recall)) : 0;

// The three non-negotiables the whole product is built on.
const RULES = [
  'No citation, no answer',
  'No human approval, no finding',
  'No eval report, no release',
];

const CAPABILITIES = [
  {
    route: '/ask',
    title: 'Ask with citations',
    body: 'Ask about the regulation and get the exact clause cited. Out-of-corpus questions are refused, not guessed.',
  },
  {
    route: '/audit',
    title: 'Audit code against the law',
    body: 'A tenancy-management app is checked against the testable requirements. Each finding is tied to the clause it violates.',
  },
  {
    route: '/review',
    title: 'Human approval',
    body: 'The AI proposes, a person decides. Every finding passes through a review queue before it counts.',
  },
  {
    route: '/evals',
    title: 'Published evals',
    body: 'The reliability numbers are measured and shown, misses included. No claim without a test behind it.',
  },
];

export default function Home() {
  return (
    <Page>
      <Stack gap="5" maxW="3xl" mb="10">
        <Text
          fontFamily="heading"
          fontSize="xs"
          letterSpacing="0.2em"
          textTransform="uppercase"
          color="accent.fg"
        >
          Governed agentic AI for regulated workflows
        </Text>
        <Heading fontFamily="heading" fontSize={{ base: '3xl', md: '4xl' }} lineHeight="1.15">
          Mizan reads the regulation, answers with citations, and audits code against it.
        </Heading>
        <Text fontSize="lg" color="fg.muted">
          A requirements auditor running on two live corpora: Dubai tenancy law and the UAE
          eInvoicing mandate. Every answer cites the exact clause, every code finding is
          human-approved before it counts, and every release publishes its eval report.
        </Text>
        <HStack gap="3" flexWrap="wrap" pt="1">
          <Button asChild bg="accent.solid" color="white" _hover={{ bg: 'teal.600' }}>
            <NextLink href="/ask">Try it: ask with citations</NextLink>
          </Button>
          <Button
            asChild
            variant="outline"
            borderColor="accent.solid"
            color="accent.fg"
            _hover={{ bg: 'accent.muted' }}
          >
            <NextLink href="/evals">See the eval report</NextLink>
          </Button>
        </HStack>
        <HStack gap="2" flexWrap="wrap" pt="2">
          <Badge colorPalette="green" variant="subtle">
            {evalPass}/{evalTotal} eval cases pass
          </Badge>
          <Badge colorPalette="teal" variant="subtle">
            audit precision {minPrecision.toFixed(2)} / recall {minRecall.toFixed(2)}
          </Badge>
          <Badge colorPalette="teal" variant="subtle">
            English and Arabic
          </Badge>
        </HStack>
      </Stack>

      <WeighingPanel />

      <RulesBand />

      <Text
        fontFamily="heading"
        fontSize="xs"
        letterSpacing="0.2em"
        textTransform="uppercase"
        color="fg.subtle"
        mb="4"
      >
        What it does
      </Text>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
        {CAPABILITIES.map(c => (
          <Box
            key={c.route}
            asChild
            borderWidth="1px"
            borderColor="border.default"
            bg="bg.panel"
            rounded="xl"
            p="5"
            transition="border-color 0.15s, transform 0.15s"
            _hover={{ borderColor: 'accent.solid', transform: 'translateY(-2px)' }}
          >
            <NextLink href={c.route}>
              <HStack justify="space-between" mb="2">
                <Text fontFamily="heading" fontSize="xs" color="accent.fg">
                  {c.route}
                </Text>
                <Text fontFamily="heading" fontSize="sm" color="fg.subtle" aria-hidden="true">
                  &rarr;
                </Text>
              </HStack>
              <Heading as="h3" fontSize="md" mb="2" color="fg.default">
                {c.title}
              </Heading>
              <Text fontSize="sm" color="fg.muted">
                {c.body}
              </Text>
            </NextLink>
          </Box>
        ))}
      </Grid>

      <Text fontSize="xs" color="fg.subtle" mt="10" maxW="3xl">
        Demonstration only, not legal advice. The corpus reproduces official texts from the Dubai
        Legislation Portal; in case of conflict the Arabic text prevails. Built by Mohamed Sayed as
        a public rebuild of a requirements-auditing engine first shipped at Dubai Land Department.
      </Text>
    </Page>
  );
}

/**
 * The signature: one real finding from the replayed audit, weighed. The mark is
 * the fulcrum; the clause and the offending code are the two pans; the verdict
 * is the reading. Content is the actual F1 finding from the cached run.
 */
function WeighingPanel() {
  return (
    <Box
      animation="mizanRise 0.5s ease-out both"
      css={{ '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }}
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.panel"
      rounded="2xl"
      p={{ base: '5', md: '7' }}
      mb="14"
    >
      <HStack justify="space-between" mb="5" flexWrap="wrap" gap="2">
        <Text fontFamily="heading" fontSize="xs" letterSpacing="wide" color="fg.subtle">
          One finding, weighed
        </Text>
        <Text fontFamily="heading" fontSize="xs" color="fg.subtle">
          from the /audit run
        </Text>
      </HStack>

      <Grid
        templateColumns={{ base: '1fr', md: '1fr auto 1fr' }}
        gap={{ base: '3', md: '6' }}
        alignItems="stretch"
      >
        <Pan label="The regulation" tone="clause">
          <Text fontFamily="heading" fontSize="xs" color="accent.fg" mb="2">
            LAW26-2007/ART-25/2
          </Text>
          <Text fontSize="sm" color="fg.muted" lineHeight="tall">
            Twelve months&rsquo; notice required before eviction.
          </Text>
        </Pan>

        <Box
          color="accent.fg"
          justifySelf="center"
          alignSelf="center"
          transform={{ base: 'rotate(90deg)', md: 'none' }}
          py={{ base: '1', md: '0' }}
        >
          <MizanMark width="56" height="56" title="weighed against" />
        </Box>

        <Pan label="The code" tone="code">
          <Text fontFamily="heading" fontSize="xs" color="fg.subtle" mb="2">
            eviction.ts:16
          </Text>
          <Box
            as="pre"
            fontFamily="heading"
            fontSize="xs"
            color="fg.default"
            bg="bg.canvas"
            borderWidth="1px"
            borderColor="border.default"
            rounded="md"
            p="2.5"
            mb="2"
            overflowX="auto"
            whiteSpace="pre"
          >
            EVICTION_NOTICE_MONTHS = 3
          </Box>
          <Text fontSize="sm" color="fg.muted" lineHeight="tall">
            Enforces three.
          </Text>
        </Pan>
      </Grid>

      <HStack
        mt="4"
        gap="3"
        p="3"
        rounded="lg"
        bg="bg.subtle"
        borderWidth="1px"
        borderColor="border.default"
        flexWrap="wrap"
      >
        <Badge colorPalette="red" variant="subtle">
          critical
        </Badge>
        <Text fontSize="sm" color="fg.muted" flex="1" minW="12ch">
          Sets 3 months where the law requires 12.
        </Text>
        <Badge colorPalette="green" variant="subtle">
          approved in review
        </Badge>
      </HStack>
    </Box>
  );
}

function Pan({
  label,
  tone,
  children,
}: {
  label: string;
  tone: 'clause' | 'code';
  children: ReactNode;
}) {
  return (
    <Box
      borderWidth="1px"
      borderColor="border.default"
      borderTopWidth="2px"
      borderTopColor={tone === 'clause' ? 'accent.solid' : 'border.default'}
      bg="bg.canvas"
      rounded="lg"
      p="3.5"
    >
      <Text
        fontFamily="heading"
        fontSize="xs"
        letterSpacing="wide"
        textTransform="uppercase"
        color="fg.subtle"
        mb="2"
      >
        {label}
      </Text>
      {children}
    </Box>
  );
}

function RulesBand() {
  return (
    <HStack
      as="ul"
      justify="center"
      gap={{ base: '3', md: '6' }}
      flexWrap="wrap"
      borderYWidth="1px"
      borderColor="border.default"
      py="4"
      mb="12"
      listStyleType="none"
    >
      {RULES.map((rule, i) => (
        <HStack as="li" key={rule} gap={{ base: '3', md: '6' }}>
          {i > 0 && (
            <Box aria-hidden="true" color="accent.fg" fontSize="xs">
              &bull;
            </Box>
          )}
          <Text fontFamily="heading" fontSize="xs" color="fg.muted" whiteSpace="nowrap">
            {rule}
          </Text>
        </HStack>
      ))}
    </HStack>
  );
}
