import NextLink from 'next/link';
import { Badge, Box, Button, Grid, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { Page } from '@/components/ui/shell';
import { evalReportSchema } from '@/lib/eval-report';
import reportJson from '@/data/evals/report.json';

const report = evalReportSchema.parse(reportJson);
const evalPass = report.suites.reduce((a, s) => a + s.passed, 0);
const evalTotal = report.suites.reduce((a, s) => a + s.total, 0);

const CAPABILITIES = [
  {
    title: 'Ask with citations',
    body: 'Ask about the regulation and get the exact clause cited. Out-of-corpus questions are refused, not guessed.',
    href: '/ask',
  },
  {
    title: 'Audit code against the law',
    body: 'A tenancy-management app is checked against the testable requirements. Each finding is tied to the clause it violates.',
    href: '/audit',
  },
  {
    title: 'Human approval',
    body: 'The AI proposes, a person decides. Every finding passes through a review queue before it counts.',
    href: '/review',
  },
  {
    title: 'Published evals',
    body: 'The reliability numbers are measured and shown, misses included. No claim without a test behind it.',
    href: '/evals',
  },
];

export default function Home() {
  return (
    <Page>
      <Stack gap="5" mb="12" maxW="3xl">
        <Text
          fontSize="sm"
          fontWeight="semibold"
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
          A requirements auditor running on Dubai tenancy law. Every answer cites the exact clause,
          every code finding is human-approved before it counts, and every release publishes its
          eval report. No citation, no answer. No human approval, no finding.
        </Text>
        <HStack gap="3" flexWrap="wrap">
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
            audit precision {report.auditScore.precision.toFixed(2)} / recall{' '}
            {report.auditScore.recall.toFixed(2)}
          </Badge>
          <Badge colorPalette="teal" variant="subtle">
            English and Arabic
          </Badge>
        </HStack>
      </Stack>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
        {CAPABILITIES.map(c => (
          <Box
            key={c.href}
            as={NextLink}
            {...{ href: c.href }}
            borderWidth="1px"
            borderColor="border.default"
            bg="bg.panel"
            rounded="xl"
            p="5"
            transition="border-color 0.15s"
            _hover={{ borderColor: 'accent.solid' }}
          >
            <Heading as="h3" fontSize="md" mb="2" color="fg.default">
              {c.title}
            </Heading>
            <Text fontSize="sm" color="fg.muted">
              {c.body}
            </Text>
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
