'use client';

import { useMemo, useState } from 'react';
import { Badge, Box, Button, Grid, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { type Finding, type FindingStatus } from '@/lib/findings';
import { FindingCard } from '@/components/FindingCard';

interface ReviewState {
  status: FindingStatus;
  note: string;
}

export default function ReviewClient({ initialFindings }: { initialFindings: Finding[] }) {
  const [reviews, setReviews] = useState<Record<string, ReviewState>>(() =>
    Object.fromEntries(initialFindings.map(f => [f.id, { status: 'proposed', note: '' }]))
  );

  const counts = useMemo(() => {
    const values = Object.values(reviews);
    return {
      approved: values.filter(r => r.status === 'approved').length,
      rejected: values.filter(r => r.status === 'rejected').length,
      pending: values.filter(r => r.status === 'proposed').length,
    };
  }, [reviews]);

  function decide(id: string, status: FindingStatus) {
    setReviews(prev => ({ ...prev, [id]: { ...prev[id], status } }));
  }

  function setNote(id: string, note: string) {
    setReviews(prev => ({ ...prev, [id]: { ...prev[id], note } }));
  }

  return (
    <Stack gap="6">
      <Grid templateColumns="repeat(3, 1fr)" gap="3">
        <Tally label="Approved" value={counts.approved} palette="green" />
        <Tally label="Rejected" value={counts.rejected} palette="red" />
        <Tally label="Pending" value={counts.pending} palette="orange" />
      </Grid>

      <Stack gap="4">
        {initialFindings.map(finding => {
          const review = reviews[finding.id];
          const merged: Finding = { ...finding, status: review.status, reviewerNote: review.note };
          return (
            <FindingCard
              key={finding.id}
              finding={merged}
              actions={
                <Stack gap="3">
                  <HStack gap="2">
                    <Button
                      size="sm"
                      variant={review.status === 'approved' ? 'solid' : 'outline'}
                      colorPalette="green"
                      onClick={() => decide(finding.id, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant={review.status === 'rejected' ? 'solid' : 'outline'}
                      colorPalette="red"
                      onClick={() => decide(finding.id, 'rejected')}
                    >
                      Reject
                    </Button>
                    {review.status !== 'proposed' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        color="fg.subtle"
                        onClick={() => decide(finding.id, 'proposed')}
                      >
                        Reset
                      </Button>
                    )}
                  </HStack>
                  <Input
                    value={review.note}
                    onChange={e => setNote(finding.id, e.target.value)}
                    placeholder="Reviewer note (optional)"
                    aria-label={`Reviewer note for ${finding.id}`}
                    size="sm"
                    bg="bg.canvas"
                    borderColor="border.default"
                    color="fg.default"
                    _placeholder={{ color: 'fg.subtle' }}
                  />
                </Stack>
              }
            />
          );
        })}
      </Stack>

      <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="xl" p="5">
        <Text fontSize="sm" fontWeight="medium" color="fg.default" mb="3">
          Decision trail
        </Text>
        <Stack gap="2">
          {initialFindings.map(finding => {
            const review = reviews[finding.id];
            return (
              <HStack key={finding.id} gap="3" fontSize="xs" flexWrap="wrap">
                <Badge
                  colorPalette={
                    review.status === 'approved'
                      ? 'green'
                      : review.status === 'rejected'
                        ? 'red'
                        : 'orange'
                  }
                  variant="subtle"
                >
                  {review.status}
                </Badge>
                <Text fontFamily="heading" color="accent.fg">
                  {finding.requirementId}
                </Text>
                <Text color="fg.muted">{finding.filePath}</Text>
                {review.note && <Text color="fg.subtle">note: {review.note}</Text>}
              </HStack>
            );
          })}
        </Stack>
      </Box>
    </Stack>
  );
}

const TALLY_COLOR: Record<string, string> = {
  green: 'success.fg',
  red: 'warn.fg',
  orange: 'warning.fg',
  gray: 'fg.muted',
};

function Tally({ label, value, palette }: { label: string; value: number; palette: string }) {
  return (
    <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="xl" p="4.5">
      <HStack justify="space-between">
        <Text fontFamily="heading" fontSize="2xl" color={TALLY_COLOR[palette] ?? 'fg.default'}>
          {value}
        </Text>
        <Badge colorPalette={palette} variant="subtle" rounded="full">
          {label}
        </Badge>
      </HStack>
    </Box>
  );
}
