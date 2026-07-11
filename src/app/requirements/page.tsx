import type { Metadata } from 'next';
import { Badge, Box, Heading, HStack, Link, Stack, Text } from '@chakra-ui/react';
import { type CorpusDocument, type RequirementUnit } from '@/lib/corpus';
import { CORPUS_LIST, type Corpus } from '@/lib/corpora';
import { Page } from '@/components/ui/shell';

export const metadata: Metadata = {
  title: 'Requirements: Mizan',
  description: 'The corpora: regulations parsed into citable requirement units.',
};

export default function RequirementsPage() {
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
          The corpora
        </Text>
        <Heading fontFamily="heading" fontSize="3xl">
          Requirements
        </Heading>
        <Text color="fg.muted" maxW="2xl">
          Each corpus is a regulation parsed into citable requirement units. Every answer and every
          audit finding in this demo points back to one of the units below.
        </Text>
      </Stack>

      {CORPUS_LIST.map(corpus => (
        <CorpusSection key={corpus.id} corpus={corpus} />
      ))}
    </Page>
  );
}

function CorpusSection({ corpus }: { corpus: Corpus }) {
  const testable = corpus.units.filter(u => u.testable).length;
  const bySource = new Map<string, RequirementUnit[]>();
  for (const unit of corpus.units) {
    bySource.set(unit.source, [...(bySource.get(unit.source) ?? []), unit]);
  }

  return (
    <Box as="section" mb="16">
      <Heading as="h2" fontFamily="heading" fontSize="2xl" mb="2">
        {corpus.name}
      </Heading>
      <Text color="fg.muted" fontSize="sm" mb="4">
        {corpus.units.length} units, {testable} testable against code.
      </Text>
      <Stack gap="3" mb="6">
        <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="lg" p="4">
          <Text fontSize="xs" color="fg.subtle">
            {corpus.disclaimer.en}
          </Text>
          {corpus.disclaimer.ar && (
            <Text fontSize="xs" color="fg.subtle" dir="rtl" lang="ar" mt="1">
              {corpus.disclaimer.ar}
            </Text>
          )}
        </Box>
        {corpus.currencyNote && (
          <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="lg" p="4">
            <Text fontSize="xs" color="fg.subtle">
              {corpus.currencyNote}
            </Text>
          </Box>
        )}
      </Stack>

      {corpus.documents.map(doc => (
        <DocumentSection key={doc.slug} doc={doc} units={bySource.get(doc.slug) ?? []} />
      ))}
    </Box>
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
        {doc.titleAr && (
          <Text as="span" dir="rtl" lang="ar">
            {doc.titleAr}{' '}
          </Text>
        )}
        {doc.amendedBy ? `· as amended by ${doc.amendedBy} ` : ''}·{' '}
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
            amended by {unit.amendedBy}
          </Badge>
        )}
      </HStack>
      <Text mt="3" fontSize="sm" lineHeight="tall" color="fg.default" whiteSpace="pre-line">
        {unit.textEn}
      </Text>
      {unit.textAr && (
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
      )}
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
