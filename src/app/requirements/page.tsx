import type { Metadata } from 'next';
import { Badge, Box, Heading, HStack, Link, Stack, Text } from '@chakra-ui/react';
import { type CorpusDocument, type RequirementUnit } from '@/lib/corpus';
import { CORPUS_LIST, type Corpus } from '@/lib/corpora';
import { Page } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import { CorpusPanels } from '@/components/CorpusPanels';
import { type Lang, translations } from '@/lib/i18n';
import { formatArticleRef, formatEditorialNote, formatTag } from '@/lib/i18n-data';

export const metadata: Metadata = {
  title: 'Requirements',
  description:
    'The corpora: regulations parsed into citable requirement units, English and Arabic.',
  alternates: {
    canonical: '/requirements',
    languages: { 'en-US': '/requirements', ar: '/ar/requirements', 'x-default': '/requirements' },
  },
};

export default function RequirementsPage({ lang = 'en' }: { lang?: Lang }) {
  const t = translations[lang].requirements;
  return (
    <Page lang={lang}>
      <PageHeader eyebrow={t.eyebrow} title={t.title} lang={lang}>
        {t.lede}
      </PageHeader>
      <ColorLegend lang={lang} />
      <Reveal delay={160}>
        <CorpusPanels
          label={t.corpusLabel}
          options={CORPUS_LIST.map(c => ({
            id: c.id,
            shortName: `${lang === 'ar' ? c.shortNameAr : c.shortName} · ${t.unitsBadge(c.units.length)}`,
          }))}
          panels={CORPUS_LIST.map(corpus => ({
            id: corpus.id,
            content: <CorpusSection corpus={corpus} lang={lang} />,
          }))}
        />
      </Reveal>
    </Page>
  );
}

function ColorLegend({ lang }: { lang: Lang }) {
  const t = translations[lang].requirements;
  // Decodes the side-rule colour on each UnitCard. Kept in the same priority
  // order as UnitCard: editorial caveat wins over testable, plain otherwise.
  const items = [
    { color: 'law.solid', label: t.legendEditorial },
    { color: 'accent.solid', label: t.legendTestable },
    { color: 'border.default', label: t.legendReference },
  ];
  return (
    <HStack gap="5" rowGap="2" flexWrap="wrap" mb="8">
      <Text
        fontSize="xs"
        fontFamily="heading"
        letterSpacing="0.1em"
        textTransform="uppercase"
        color="fg.subtle"
      >
        {t.legendTitle}
      </Text>
      {items.map(item => (
        <HStack key={item.label} gap="2.5">
          <Box w="1" h="5" rounded="full" bg={item.color} flexShrink="0" aria-hidden="true" />
          <Text fontSize="xs" color="fg.muted">
            {item.label}
          </Text>
        </HStack>
      ))}
    </HStack>
  );
}

function CorpusSection({ corpus, lang }: { corpus: Corpus; lang: Lang }) {
  const t = translations[lang].requirements;
  const testable = corpus.units.filter(u => u.testable).length;
  const bySource = new Map<string, RequirementUnit[]>();
  for (const unit of corpus.units) {
    bySource.set(unit.source, [...(bySource.get(unit.source) ?? []), unit]);
  }

  return (
    <Box as="section">
      <Text fontSize="sm" color="fg.subtle" mb="4">
        {t.unitsLine(corpus.units.length, testable)}
        {corpus.bilingual ? t.bilingualSuffix : ''}
      </Text>
      <Stack gap="3" mb="8">
        <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="lg" p="4">
          <Text fontSize="xs" color="fg.subtle">
            {lang === 'ar' ? (corpus.disclaimer.ar ?? corpus.disclaimer.en) : corpus.disclaimer.en}
          </Text>
          {lang === 'en' && corpus.disclaimer.ar && (
            <Text fontSize="xs" color="fg.subtle" dir="rtl" lang="ar" mt="1" fontFamily="arabic">
              {corpus.disclaimer.ar}
            </Text>
          )}
        </Box>
        {corpus.currencyNote && (
          <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="lg" p="4">
            <Text fontSize="xs" color="fg.subtle">
              {lang === 'ar' ? (corpus.currencyNoteAr ?? corpus.currencyNote) : corpus.currencyNote}
            </Text>
          </Box>
        )}
      </Stack>

      {corpus.documents.map(doc => (
        <DocumentSection
          key={doc.slug}
          doc={doc}
          units={bySource.get(doc.slug) ?? []}
          lang={lang}
          official={corpus.bilingual}
        />
      ))}
    </Box>
  );
}

function DocumentSection({
  doc,
  units,
  lang,
  official,
}: {
  doc: CorpusDocument;
  units: RequirementUnit[];
  lang: Lang;
  /** True when the corpus's Arabic text is the authentic official version. */
  official: boolean;
}) {
  const t = translations[lang].requirements;
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
          {lang === 'ar' ? (doc.titleAr ?? doc.titleEn) : doc.titleEn}
        </Heading>
        <Text fontSize="sm" color="fg.subtle">
          {doc.amendedBy ? `${t.amendedByPrefix} ${doc.amendedBy} · ` : ''}
          <Link
            href={
              lang === 'ar' ? (doc.officialSourceAr ?? doc.officialSourceEn) : doc.officialSourceEn
            }
            color="accent.fg"
            rel="noopener noreferrer"
          >
            {t.officialSource}
          </Link>
        </Text>
      </HStack>
      {/* The English page cross-references the authentic Arabic title (it
          prevails on conflict); the Arabic page needs no English echo. */}
      {lang === 'en' && doc.titleAr && (
        <Text fontSize="sm" color="fg.subtle" mt="2" dir="rtl" lang="ar" fontFamily="arabic">
          {doc.titleAr}
        </Text>
      )}
      <Stack gap="4" mt="6">
        {units.map(unit => (
          <UnitCard key={unit.id} unit={unit} lang={lang} official={official} />
        ))}
      </Stack>
    </Box>
  );
}

function UnitCard({
  unit,
  lang,
  official,
}: {
  unit: RequirementUnit;
  lang: Lang;
  official: boolean;
}) {
  const t = translations[lang].requirements;
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
      _hover={{ transform: lang === 'ar' ? 'translateX(-3px)' : 'translateX(3px)' }}
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
          {formatArticleRef(unit.articleRef, lang)}
        </Text>
        {unit.testable && (
          <Badge colorPalette="teal" variant="subtle" rounded="full">
            {t.testable}
          </Badge>
        )}
        {unit.amendedBy && (
          <Badge colorPalette="orange" variant="subtle" rounded="full">
            {t.amendedBy(unit.amendedBy)}
          </Badge>
        )}
      </HStack>
      <Text
        mt="3.5"
        fontSize={lang === 'ar' && unit.textAr ? 'md' : 'sm'}
        lineHeight={lang === 'ar' && unit.textAr ? '1.9' : '1.7'}
        color="fg.default"
        whiteSpace="pre-line"
        dir={lang === 'ar' && unit.textAr ? 'rtl' : 'ltr'}
        fontFamily={lang === 'ar' && unit.textAr ? 'arabic' : undefined}
      >
        {lang === 'ar' ? (unit.textAr ?? unit.textEn) : unit.textEn}
      </Text>
      {lang === 'en' && official && unit.textAr && (
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
          borderColor="law.line"
          bg="law.muted"
          rounded="lg"
          px="3.5"
          py="2.5"
        >
          <Text fontSize="xs" color="law.fg">
            {t.editorialNote} {formatEditorialNote(unit.id, unit.editorialNote, lang)}
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
              {formatTag(tag, lang)}
            </Box>
          ))}
        </HStack>
      )}
    </Box>
  );
}
