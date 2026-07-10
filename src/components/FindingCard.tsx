import { Badge, Box, Grid, GridItem, HStack, Link, Stack, Text } from '@chakra-ui/react';
import { type Finding } from '@/lib/findings';
import { SEVERITY_PALETTE } from '@/lib/severity';
import { requirementById } from '@/lib/requirement-lookup';
import { type ReactNode } from 'react';

/**
 * Renders one finding with the requirement clause and the offending code side
 * by side. `actions` slots in the approve/reject controls in the review queue;
 * omitted, the card is read-only.
 */
export function FindingCard({ finding, actions }: { finding: Finding; actions?: ReactNode }) {
  const unit = requirementById(finding.requirementId);
  return (
    <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="xl" p="5">
      <HStack gap="2" flexWrap="wrap" mb="3">
        <Badge colorPalette={SEVERITY_PALETTE[finding.severity]} variant="solid">
          {finding.severity}
        </Badge>
        {finding.status !== 'proposed' && (
          <Badge colorPalette={finding.status === 'approved' ? 'green' : 'gray'} variant="subtle">
            {finding.status}
          </Badge>
        )}
        <Text fontSize="sm" fontWeight="medium" color="fg.default">
          {finding.summary}
        </Text>
      </HStack>

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="4">
        <GridItem>
          <Text
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="wide"
            color="fg.subtle"
            mb="1"
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
            <Text mt="2" fontSize="sm" color="fg.muted" lineHeight="tall">
              {unit.textEn.length > 320 ? `${unit.textEn.slice(0, 320)}...` : unit.textEn}
            </Text>
          )}
        </GridItem>
        <GridItem>
          <Text
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="wide"
            color="fg.subtle"
            mb="1"
          >
            Code · {finding.filePath}:{finding.lineStart}
            {finding.lineEnd !== finding.lineStart ? `-${finding.lineEnd}` : ''}
          </Text>
          <Box
            as="pre"
            bg="bg.canvas"
            borderWidth="1px"
            borderColor="border.default"
            rounded="md"
            p="3"
            fontFamily="heading"
            fontSize="xs"
            color="fg.default"
            overflowX="auto"
            whiteSpace="pre"
          >
            {finding.codeExcerpt}
          </Box>
        </GridItem>
      </Grid>

      <Stack gap="1" mt="4">
        <Text fontSize="sm" color="fg.muted">
          <Text as="span" color="fg.subtle">
            Evidence:{' '}
          </Text>
          {finding.evidence}
        </Text>
        <Text fontSize="sm" color="fg.muted">
          <Text as="span" color="fg.subtle">
            Recommended:{' '}
          </Text>
          {finding.recommendedAction}
        </Text>
      </Stack>

      {actions && <Box mt="4">{actions}</Box>}
    </Box>
  );
}
