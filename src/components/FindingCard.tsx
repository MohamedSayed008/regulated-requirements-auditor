import { Badge, Box, Grid, HStack, Link, Text } from '@chakra-ui/react';
import { type Finding } from '@/lib/findings';
import { SEVERITY_PALETTE } from '@/lib/severity';
import { requirementById } from '@/lib/requirement-lookup';
import { type Lang, localePath, translations } from '@/lib/i18n';
import { CodeExcerpt } from '@/components/CodeExcerpt';
import { type ReactNode } from 'react';

/**
 * One finding as a case record: severity + summary header, the requirement and
 * the offending code split side by side, evidence and recommendation in the
 * footer. `actions` slots the approve/reject controls in the review queue;
 * omitted, the card is read-only. An approved card gets a green border tint.
 */
export function FindingCard({
  finding,
  actions,
  lang = 'en',
}: {
  finding: Finding;
  actions?: ReactNode;
  lang?: Lang;
}) {
  const t = translations[lang].finding;
  const unit = requirementById(finding.requirementId);
  const unitText = lang === 'ar' ? (unit?.textAr ?? unit?.textEn) : unit?.textEn;
  const lines =
    finding.lineEnd !== finding.lineStart
      ? `${finding.lineStart}-${finding.lineEnd}`
      : String(finding.lineStart);
  return (
    <Box
      borderWidth="1px"
      borderColor={finding.status === 'approved' ? 'success.line' : 'border.default'}
      bg="bg.panel"
      rounded="2xl"
      overflow="hidden"
    >
      <HStack
        gap="2.5"
        px="5"
        py="4"
        borderBottomWidth="1px"
        borderColor="border.default"
        flexWrap="wrap"
      >
        <Badge
          colorPalette={SEVERITY_PALETTE[finding.severity]}
          variant={finding.severity === 'critical' ? 'solid' : 'subtle'}
          rounded="full"
        >
          {t.severity[finding.severity] ?? finding.severity}
        </Badge>
        {finding.status !== 'proposed' && (
          <Badge
            colorPalette={finding.status === 'approved' ? 'green' : 'red'}
            variant="subtle"
            rounded="full"
          >
            {t.status[finding.status] ?? finding.status}
          </Badge>
        )}
        <Text fontSize="sm" fontWeight="500" color="fg.default">
          {finding.summary}
        </Text>
      </HStack>

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }}>
        <Box
          px="5"
          py="5"
          borderEndWidth={{ base: '0', md: '1px' }}
          borderBottomWidth={{ base: '1px', md: '0' }}
          borderColor="border.default"
        >
          <Text
            fontFamily="heading"
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="0.1em"
            color="fg.subtle"
            mb="2"
          >
            {t.requirement}
          </Text>
          <Link
            href={`${localePath(lang, '/requirements')}#${finding.requirementId}`}
            fontFamily="heading"
            fontSize="xs"
            color="accent.fg"
          >
            {finding.requirementId}
          </Link>
          {unit && unitText && (
            <Text
              mt="2.5"
              fontSize="sm"
              color="fg.muted"
              lineHeight="1.6"
              fontFamily={lang === 'ar' && unit.textAr ? 'arabic' : undefined}
            >
              {unitText.length > 320 ? `${unitText.slice(0, 320)}...` : unitText}
            </Text>
          )}
        </Box>
        <Box px="5" py="5">
          <Text
            fontFamily="heading"
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="0.1em"
            color="fg.subtle"
            mb="2"
          >
            {t.code} &middot; {finding.filePath}:{lines}
          </Text>
          <CodeExcerpt code={finding.codeExcerpt} />
        </Box>
      </Grid>

      <Box px="5" py="4" borderTopWidth="1px" borderColor="border.default">
        <Text fontSize="sm" color="fg.muted" lineHeight="1.7">
          <Text as="span" color="fg.subtle">
            {t.evidence}{' '}
          </Text>
          {finding.evidence}
        </Text>
        <Text fontSize="sm" color="fg.muted" lineHeight="1.7" mt="1">
          <Text as="span" color="fg.subtle">
            {t.recommended}{' '}
          </Text>
          {finding.recommendedAction}
        </Text>
        {actions && <Box mt="4">{actions}</Box>}
      </Box>
    </Box>
  );
}
