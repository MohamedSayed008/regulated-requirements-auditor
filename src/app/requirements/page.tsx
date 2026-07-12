import type { Metadata } from 'next';
import { Badge, Box, Heading, HStack, Link, Stack, Text } from '@chakra-ui/react';
import { type CorpusDocument, type RequirementUnit } from '@/lib/corpus';
import { CORPUS_LIST, type Corpus } from '@/lib/corpora';
import { Page } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import { CorpusPanels } from '@/components/CorpusPanels';

export const metadata: Metadata = {
  title: 'Requirements',
  description:
    'The corpora: regulations parsed into citable requirement units, English and Arabic.',
  alternates: { canonical: '/requirements' },
};

export default function RequirementsPage() {
  return (
    <Page>
      <PageHeader eyebrow="The corpora" title="Requirements">
        Each corpus is a regulation parsed into citable requirement units. Every answer and every
        audit finding in this demo points back to one of the units below.
      </PageHeader>
      <Reveal delay={160}>
        <CorpusPanels
          options={CORPUS_LIST.map(c => ({
            id: c.id,
            shortName: `${c.shortName} · ${c.units.length} units`,
          }))}
          panels={CORPUS_LIST.map(corpus => ({
            id: corpus.id,
            content: <CorpusSection corpus={corpus} />,
          }))}
        />
      </Reveal>
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
    <Box as="section">
      <Text fontSize="sm" color="fg.subtle" mb="4">
        {corpus.units.length} units, {testable} testable against code
        {corpus.bilingual ? ' · bilingual (English / العربية)' : ''}
      </Text>
      <Stack gap="3" mb="8">
        <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="lg" p="4">
          <Text fontSize="xs" color="fg.subtle">
            {corpus.disclaimer.en}
          </Text>
          {corpus.disclaimer.ar && (
            <Text fontSize="xs" color="fg.subtle" dir="rtl" lang="ar" mt="1" fontFamily="arabic">
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
      <HStack
        justify="space-between"
        align="baseline"
        flexWrap="wrap"
        gap="2"
        borderBottomWidth="1px"
        borderColor="border.default"
        pb="3.5"
      >
        <Heading id={doc.slug} as="h2" fontFamily="heading" fontSize="xl">
          {doc.titleEn}
        </Heading>
        <Text fontSize="sm" color="fg.subtle">
          {doc.amendedBy ? `as amended by ${doc.amendedBy} · ` : ''}
          <Link href={doc.officialSourceEn} color="accent.fg" rel="noopener noreferrer">
            official source
          </Link>
        </Text>
      </HStack>
      {doc.titleAr && (
        <Text fontSize="sm" color="fg.subtle" mt="2" dir="rtl" lang="ar" fontFamily="arabic">
          {doc.titleAr}
        </Text>
      )}
      <Stack gap="4" mt="6">
        {units.map(unit => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </Stack>
    </Box>
  );
}

function UnitCard({ unit }: { unit: RequirementUnit }) {
  // Left rule encodes the unit's nature: gold marks an editorial caveat, teal a
  // testable unit, plain line otherwise.
  const rule = unit.editorialNote ? 'law.solid' : unit.testable ? 'accent.solid' : 'border.default';
  return (
    <Box
      id={unit.id}
      scrollMarginTop="24"
      borderWidth="1px"
      borderColor="border.default"
      borderStartWidth="3px"
      borderStartColor={rule}
      bg="bg.panel"
      rounded="xl"
      p="5"
      transition="transform 0.25s"
      _hover={{ transform: 'translateX(3px)' }}
    >
      <HStack gap="2.5" flexWrap="wrap">
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
          <Badge colorPalette="teal" variant="subtle" rounded="full">
            testable
          </Badge>
        )}
        {unit.amendedBy && (
          <Badge colorPalette="orange" variant="subtle" rounded="full">
            amended by {unit.amendedBy}
          </Badge>
        )}
      </HStack>
      <Text mt="3.5" fontSize="sm" lineHeight="1.7" color="fg.default" whiteSpace="pre-line">
        {unit.textEn}
      </Text>
      {unit.textAr && (
        <Text
          mt="3.5"
          fontSize="md"
          lineHeight="1.9"
          color="fg.muted"
          whiteSpace="pre-line"
          dir="rtl"
          lang="ar"
          fontFamily="arabic"
          borderInlineStartWidth="2px"
          borderColor="border.default"
          ps="4"
        >
          {unit.textAr}
        </Text>
      )}
      {unit.editorialNote && (
        <Box
          mt="3.5"
          borderWidth="1px"
          borderColor="gold.900"
          bg="law.muted"
          rounded="lg"
          px="3.5"
          py="2.5"
        >
          <Text fontSize="xs" color="law.fg">
            Editorial note: {unit.editorialNote}
          </Text>
        </Box>
      )}
      {unit.tags.length > 0 && (
        <HStack gap="1.5" mt="3.5" flexWrap="wrap">
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
