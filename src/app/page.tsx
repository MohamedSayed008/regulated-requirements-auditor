import { type ReactNode } from 'react';
import NextLink from 'next/link';
import { Badge, Box, Container, Grid, Heading, HStack, Text } from '@chakra-ui/react';
import { Page } from '@/components/ui/shell';
import { Reveal } from '@/components/ui/Reveal';
import { CountUp } from '@/components/ui/CountUp';
import { ScaleHero } from '@/components/ScaleHero';
import { RulesMarquee } from '@/components/RulesMarquee';
import { evalReportSetSchema } from '@/lib/eval-report';
import reportsJson from '@/data/evals/reports.json';

const reports = evalReportSetSchema.parse(reportsJson);
const evalPass = reports.reduce((a, r) => a + r.report.suites.reduce((s, x) => s + x.passed, 0), 0);
const evalTotal = reports.reduce((a, r) => a + r.report.suites.reduce((s, x) => s + x.total, 0), 0);
const minPrecision = reports.length
  ? Math.min(...reports.map(r => r.report.auditScore.precision))
  : 0;
const minRecall = reports.length ? Math.min(...reports.map(r => r.report.auditScore.recall)) : 0;

const HERO_QUESTION = 'How much notice is needed before a rent increase?';

const PIPELINE = [
  {
    route: '/ask',
    title: 'Ask with citations',
    body: "Grounded Q&A over the corpus. Citations come from the model's citation output, not prompt engineering. Out-of-corpus questions are refused, and the refusal is eval-tested.",
    wide: true,
    tint: 'panel',
  },
  {
    route: '/audit',
    title: 'Audit code',
    body: 'Zod-validated findings, each tied to a clause with file and line.',
    wide: false,
    tint: 'panel',
  },
  {
    route: '/review',
    title: 'Human approval',
    body: 'The AI proposes; a person decides. Nothing counts until approved.',
    wide: false,
    tint: 'panel',
  },
  {
    route: '/evals',
    title: 'Published evals',
    body: 'Groundedness, refusal, injection resistance, and audit precision/recall against a seeded ground truth. Graders are programmatic, so the numbers are reproducible, misses included.',
    wide: true,
    tint: 'teal',
  },
] as const;

export default function Home() {
  return (
    <Page bleed>
      <Container maxW="6xl" pt={{ base: '14', md: '20' }} pb="16">
        <Grid
          templateColumns={{ base: '1fr', lg: '1.15fr 0.85fr' }}
          gap={{ base: '10', lg: '14' }}
          alignItems="center"
        >
          <Box>
            <Reveal>
              <HStack
                display="inline-flex"
                gap="2.5"
                fontFamily="heading"
                fontSize="xs"
                letterSpacing="0.16em"
                textTransform="uppercase"
                color="law.fg"
                borderWidth="1px"
                borderColor="border.default"
                rounded="full"
                px="3.5"
                py="1.5"
                mb="6"
              >
                <Box
                  w="1.5"
                  h="1.5"
                  rounded="full"
                  bg="accent.fg"
                  animation="pulseDot 2s infinite"
                  _motionReduce={{ animation: 'none' }}
                />
                <Text as="span">Governed agentic AI &middot; live</Text>
              </HStack>
            </Reveal>
            <Reveal delay={60}>
              <Heading
                as="h1"
                fontFamily="serif"
                fontWeight="400"
                fontSize={{ base: '4xl', md: '6xl' }}
                lineHeight="1.07"
                letterSpacing="-0.01em"
                mb="5"
              >
                Reads the law.
                <br />
                Cites the clause.
                <br />
                <Text as="span" color="law.fg" fontStyle="italic">
                  Weighs your code
                </Text>{' '}
                against it.
              </Heading>
            </Reveal>
            <Reveal delay={120}>
              <Text fontSize="lg" color="fg.muted" lineHeight="1.6" maxW="52ch" mb="7">
                A requirements auditor on two live corpora: Dubai tenancy law and the UAE eInvoicing
                mandate. No citation, no answer. No human approval, no finding. No eval report, no
                release.
              </Text>
            </Reveal>
            <Reveal delay={180}>
              <Box asChild display="block" maxW="lg">
                <NextLink
                  href={`/ask?q=${encodeURIComponent(HERO_QUESTION)}`}
                  aria-label={`Ask: ${HERO_QUESTION}`}
                >
                  <HStack
                    gap="2.5"
                    bg="bg.panel"
                    borderWidth="1px"
                    borderColor="border.default"
                    rounded="xl"
                    p="2"
                    ps="4"
                    transition="border-color 0.25s"
                    _hover={{ borderColor: 'accent.solid' }}
                  >
                    <Text fontFamily="heading" fontSize="sm" color="fg.subtle">
                      /ask
                    </Text>
                    <Text flex="1" fontSize="sm" color="fg.muted" truncate>
                      {HERO_QUESTION}
                    </Text>
                    <Box
                      fontSize="sm"
                      fontWeight="600"
                      color="white"
                      bg="accent.solid"
                      px="5"
                      py="2.5"
                      rounded="lg"
                    >
                      Ask
                    </Box>
                  </HStack>
                </NextLink>
              </Box>
            </Reveal>
          </Box>

          <Reveal delay={200} display={{ base: 'none', lg: 'flex' }} justifyContent="center">
            <ScaleHero />
          </Reveal>
        </Grid>

        <Reveal delay={240}>
          <Grid
            templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
            mt="14"
            borderWidth="1px"
            borderColor="border.default"
            rounded="2xl"
            overflow="hidden"
            bg="bg.panel"
          >
            <StatCell
              value={
                <>
                  <CountUp to={evalPass} />/{evalTotal}
                </>
              }
              label="eval cases pass"
            />
            <StatCell
              value={<CountUp to={minPrecision} decimals={2} />}
              label="min audit precision"
              color="accent.fg"
            />
            <StatCell
              value={<CountUp to={minRecall} decimals={2} />}
              label="min audit recall"
              color="accent.fg"
            />
            <Box p="5">
              <Text fontFamily="serif" fontSize="2xl" color="law.fg">
                English &middot; العربية
              </Text>
              <Text fontSize="sm" color="fg.subtle" mt="1">
                bilingual, RTL-aware
              </Text>
            </Box>
          </Grid>
        </Reveal>
      </Container>

      <RulesMarquee />

      <Container maxW="6xl" py={{ base: '16', md: '24' }}>
        <Reveal>
          <Text
            fontFamily="heading"
            fontSize="xs"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="law.fg"
            mb="3.5"
          >
            One finding, weighed
          </Text>
        </Reveal>
        <Reveal delay={60}>
          <Heading
            as="h2"
            fontFamily="serif"
            fontWeight="400"
            fontSize={{ base: '2xl', md: '4xl' }}
            mb="9"
            maxW="24ch"
          >
            Every finding ties one line of code to the clause it breaks.
          </Heading>
        </Reveal>
        <Reveal delay={120}>
          <Box
            borderWidth="1px"
            borderColor="border.default"
            rounded="2xl"
            overflow="hidden"
            bg="bg.panel"
          >
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }}>
              <Box
                p="8"
                borderEndWidth={{ base: '0', md: '1px' }}
                borderBottomWidth={{ base: '1px', md: '0' }}
                borderColor="border.default"
                position="relative"
              >
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  w="100%"
                  h="3px"
                  bg="linear-gradient(90deg, #e6cd86, transparent)"
                />
                <Text
                  fontFamily="heading"
                  fontSize="xs"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  color="law.fg"
                  mb="4"
                >
                  The law
                </Text>
                <Text fontFamily="heading" fontSize="xs" color="law.fg" mb="2.5">
                  LAW26-2007/ART-25/2
                </Text>
                <Text fontFamily="serif" fontSize="xl" lineHeight="1.55" color="fg.default">
                  The Landlord must notify the Tenant of the eviction reasons at least{' '}
                  <Text as="span" color="law.fg">
                    twelve (12) months
                  </Text>{' '}
                  before the date of eviction, through a Notary Public or by registered mail.
                </Text>
              </Box>
              <Box p="8" position="relative">
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  w="100%"
                  h="3px"
                  bg="linear-gradient(90deg, #0f766e, transparent)"
                />
                <Text
                  fontFamily="heading"
                  fontSize="xs"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  color="accent.fg"
                  mb="4"
                >
                  The code &middot; eviction.ts:16
                </Text>
                <Box
                  as="pre"
                  fontFamily="heading"
                  fontSize="sm"
                  lineHeight="1.7"
                  color="fg.default"
                  bg="bg.canvas"
                  borderWidth="1px"
                  borderColor="border.default"
                  rounded="lg"
                  p="4"
                  mb="4"
                  overflowX="auto"
                >
                  <Text as="span" color="fg.subtle">
                    14
                  </Text>
                  {'  '}
                  <Text as="span" color="code.kw">
                    export const
                  </Text>{' '}
                  <Text as="span" color="accent.fg">
                    EVICTION_NOTICE_MONTHS
                  </Text>{' '}
                  ={' '}
                  <Text
                    as="span"
                    color="warn.fg"
                    bg="rgba(192, 57, 47, 0.22)"
                    rounded="xs"
                    px="0.5"
                  >
                    3
                  </Text>
                  ;
                </Box>
                <Text fontSize="sm" color="fg.muted" lineHeight="1.6">
                  Enforces three months where the law requires twelve: evictions become lawful far
                  sooner than Article 25(2) allows.
                </Text>
              </Box>
            </Grid>
            <HStack
              gap="3.5"
              px="8"
              py="4"
              bg="bg.subtle"
              borderTopWidth="1px"
              borderColor="border.default"
              flexWrap="wrap"
            >
              <Badge colorPalette="red" variant="solid">
                critical
              </Badge>
              <Text fontSize="sm" color="fg.muted" flex="1" minW="20ch">
                Detected, cited, and routed to human review.
              </Text>
              <Badge colorPalette="green" variant="subtle">
                approved in review
              </Badge>
            </HStack>
          </Box>
        </Reveal>
      </Container>

      <Container maxW="6xl" pb={{ base: '16', md: '24' }}>
        <Reveal>
          <HStack justify="space-between" align="end" mb="7" flexWrap="wrap" gap="4">
            <Heading
              as="h2"
              fontFamily="serif"
              fontWeight="400"
              fontSize={{ base: '2xl', md: '3xl' }}
            >
              The pipeline, end to end
            </Heading>
            <Text fontFamily="heading" fontSize="xs" color="fg.subtle">
              governed at every step
            </Text>
          </HStack>
        </Reveal>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="4">
          {PIPELINE.map((card, i) => (
            <Reveal
              key={card.route}
              delay={i * 70}
              gridColumn={{ base: 'auto', md: card.wide ? 'span 2' : 'auto' }}
            >
              <Box
                asChild
                display="block"
                h="100%"
                borderWidth="1px"
                borderColor="border.default"
                bg="bg.panel"
                backgroundImage={
                  card.tint === 'teal'
                    ? 'linear-gradient(150deg, rgba(15, 118, 110, 0.10), transparent)'
                    : undefined
                }
                rounded="2xl"
                p="7"
                transition="transform 0.3s, border-color 0.3s"
                _hover={{ transform: 'translateY(-4px)', borderColor: 'accent.solid' }}
              >
                <NextLink href={card.route}>
                  <HStack justify="space-between" mb="3.5">
                    <Text fontFamily="heading" fontSize="xs" color="accent.fg">
                      {card.route}
                    </Text>
                    <Text color="law.fg" fontSize="lg" aria-hidden="true">
                      &rarr;
                    </Text>
                  </HStack>
                  <Heading as="h3" fontFamily="serif" fontWeight="500" fontSize="xl" mb="2">
                    {card.title}
                  </Heading>
                  <Text fontSize="sm" color="fg.muted" lineHeight="1.55" maxW="52ch">
                    {card.body}
                  </Text>
                </NextLink>
              </Box>
            </Reveal>
          ))}
        </Grid>
      </Container>
    </Page>
  );
}

function StatCell({
  value,
  label,
  color = 'fg.default',
}: {
  value: ReactNode;
  label: string;
  color?: string;
}) {
  return (
    <Box
      p="5"
      borderEndWidth={{ base: '0', md: '1px' }}
      borderColor="border.default"
      _last={{ borderEndWidth: '0' }}
    >
      <Text fontFamily="heading" fontSize="3xl" color={color}>
        {value}
      </Text>
      <Text fontSize="sm" color="fg.subtle" mt="1">
        {label}
      </Text>
    </Box>
  );
}
