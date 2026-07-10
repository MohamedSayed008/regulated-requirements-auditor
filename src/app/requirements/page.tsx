import type { Metadata } from 'next';
import { Badge, Box, Heading, HStack, Link, Stack, Text } from '@chakra-ui/react';
import {
  CORPUS_CURRENCY,
  CORPUS_DISCLAIMER,
  type CorpusDocument,
  type RequirementUnit,
  corpusDocumentSchema,
  parseCorpus,
} from '@/lib/corpus';
import { Page } from '@/components/ui/shell';
import documentsJson from '@/data/corpus/documents.json';
import law26Json from '@/data/corpus/law-26-2007.json';
import decree43Json from '@/data/corpus/decree-43-2013.json';

export const metadata: Metadata = {
  title: 'Requirements: Mizan',
  description:
    'The corpus: Dubai tenancy law parsed into citable requirement units, English and Arabic.',
};

const documents = documentsJson.map(d => corpusDocumentSchema.parse(d));
const unitsBySource = new Map<string, RequirementUnit[]>([
  ['LAW26-2007', parseCorpus(law26Json)],
  ['DEC43-2013', parseCorpus(decree43Json)],
]);

export default function RequirementsPage() {
  const all = [...unitsBySource.values()].flat();
  const total = all.length;
  const testable = all.filter(u => u.testable).length;

  return (
    <Page>
      <Stack gap="4" mb="10">
        <Text
          fontSize="sm"
          fontWeight="semibold"
          letterSpacing="0.2em"
          textTransform="uppercase"
          color="accent.fg"
        >
          The corpus
        </Text>
        <Heading fontFamily="heading" fontSize="3xl">
          Requirements
        </Heading>
        <Text color="fg.muted" maxW="2xl">
          Dubai tenancy law parsed into {total} citable requirement units, {testable} of them
          testable against code. Every answer and every audit finding in this demo points back to
          one of the units below.
        </Text>
        <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="lg" p="4">
          <Text fontSize="xs" color="fg.subtle">
            {CORPUS_DISCLAIMER.en}
          </Text>
          <Text fontSize="xs" color="fg.subtle" dir="rtl" lang="ar" mt="1">
            {CORPUS_DISCLAIMER.ar}
          </Text>
        </Box>
        <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="lg" p="4">
          <Text fontSize="xs" color="fg.subtle">
            {CORPUS_CURRENCY.note}
          </Text>
        </Box>
      </Stack>

      {documents.map(doc => (
        <DocumentSection key={doc.slug} doc={doc} units={unitsBySource.get(doc.slug) ?? []} />
      ))}
    </Page>
  );
}

function DocumentSection({ doc, units }: { doc: CorpusDocument; units: RequirementUnit[] }) {
  return (
    <Box as="section" aria-labelledby={doc.slug} mb="14">
      <Heading
        id={doc.slug}
        as="h2"
        fontSize="xl"
        borderBottomWidth="1px"
        borderColor="border.default"
        pb="3"
      >
        {doc.titleEn}
      </Heading>
      <Text fontSize="sm" color="fg.subtle" mt="2">
        <Text as="span" dir="rtl" lang="ar">
          {doc.titleAr}
        </Text>
        {doc.amendedBy ? ` · as amended by ${doc.amendedBy}` : ''} ·{' '}
        <Link href={doc.officialSourceEn} color="accent.fg" rel="noopener noreferrer">
          official source
        </Link>
      </Text>
      <Stack gap="4" mt="6">
        {units.map(unit => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </Stack>
    </Box>
  );
}

function UnitCard({ unit }: { unit: RequirementUnit }) {
  return (
    <Box
      id={unit.id}
      scrollMarginTop="24"
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.panel"
      rounded="xl"
      p="5"
    >
      <HStack gap="2" flexWrap="wrap">
        <Box
          as="code"
          bg="bg.subtle"
          px="2"
          py="0.5"
          rounded="sm"
          fontFamily="heading"
          fontSize="xs"
          color="accent.fg"
        >
          {unit.id}
        </Box>
        <Text fontSize="sm" fontWeight="medium" color="fg.default">
          {unit.articleRef}
        </Text>
        {unit.testable && (
          <Badge colorPalette="teal" variant="subtle">
            testable
          </Badge>
        )}
        {unit.amendedBy && (
          <Badge colorPalette="orange" variant="subtle">
            amended by Law 33/2008
          </Badge>
        )}
      </HStack>
      <Text mt="3" fontSize="sm" lineHeight="tall" color="fg.default" whiteSpace="pre-line">
        {unit.textEn}
      </Text>
      <Text
        mt="3"
        fontSize="sm"
        lineHeight="tall"
        color="fg.muted"
        whiteSpace="pre-line"
        dir="rtl"
        lang="ar"
        borderInlineStartWidth="2px"
        borderColor="border.default"
        ps="4"
      >
        {unit.textAr}
      </Text>
      {unit.editorialNote && (
        <Box
          mt="3"
          borderWidth="1px"
          borderColor="orange.900"
          bg="orange.950"
          rounded="lg"
          px="3"
          py="2"
        >
          <Text fontSize="xs" color="orange.300">
            Editorial note: {unit.editorialNote}
          </Text>
        </Box>
      )}
      {unit.tags.length > 0 && (
        <HStack gap="1.5" mt="3" flexWrap="wrap">
          {unit.tags.map(tag => (
            <Box
              key={tag}
              bg="bg.subtle"
              px="2"
              py="0.5"
              rounded="sm"
              fontSize="xs"
              color="fg.subtle"
            >
              {tag}
            </Box>
          ))}
        </HStack>
      )}
    </Box>
  );
}
