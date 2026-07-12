import { Badge, Box, Grid, HStack, Link, Text } from '@chakra-ui/react';
import { type Finding } from '@/lib/findings';
import { SEVERITY_PALETTE } from '@/lib/severity';
import { requirementById } from '@/lib/requirement-lookup';
import { type ReactNode } from 'react';

/**
 * One finding as a case record: severity + summary header, the requirement and
 * the offending code split side by side, evidence and recommendation in the
 * footer. `actions` slots the approve/reject controls in the review queue;
 * omitted, the card is read-only. An approved card gets a green border tint.
 */
export function FindingCard({ finding, actions }: { finding: Finding; actions?: ReactNode }) {
  const unit = requirementById(finding.requirementId);
  const lines =
    finding.lineEnd !== finding.lineStart
      ? `${finding.lineStart}-${finding.lineEnd}`
      : String(finding.lineStart);
  return (
    <Box
      borderWidth="1px"
      borderColor={finding.status === 'approved' ? 'green.900' : 'border.default'}
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
          {finding.severity}
        </Badge>
        {finding.status !== 'proposed' && (
          <Badge
            colorPalette={finding.status === 'approved' ? 'green' : 'red'}
            variant="subtle"
            rounded="full"
          >
            {finding.status}
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
            Requirement
          </Text>
          <Link
            href={`/requirements#${finding.requirementId}`}
            fontFamily="heading"
            fontSize="xs"
            color="accent.fg"
          >
            {finding.requirementId}
          </Link>
          {unit && (
            <Text mt="2.5" fontSize="sm" color="fg.muted" lineHeight="1.6">
              {unit.textEn.length > 320 ? `${unit.textEn.slice(0, 320)}...` : unit.textEn}
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
            Code &middot; {finding.filePath}:{lines}
          </Text>
          <Box
            as="pre"
            bg="bg.canvas"
            borderWidth="1px"
            borderColor="border.default"
            rounded="lg"
            p="3"
            fontFamily="heading"
            fontSize="xs"
            color="fg.default"
            overflowX="auto"
            whiteSpace="pre"
          >
            {finding.codeExcerpt}
          </Box>
        </Box>
      </Grid>

      <Box px="5" py="4" borderTopWidth="1px" borderColor="border.default">
        <Text fontSize="sm" color="fg.muted" lineHeight="1.7">
          <Text as="span" color="fg.subtle">
            Evidence:{' '}
          </Text>
          {finding.evidence}
        </Text>
        <Text fontSize="sm" color="fg.muted" lineHeight="1.7" mt="1">
          <Text as="span" color="fg.subtle">
            Recommended:{' '}
          </Text>
          {finding.recommendedAction}
        </Text>
        {actions && <Box mt="4">{actions}</Box>}
      </Box>
    </Box>
  );
}
