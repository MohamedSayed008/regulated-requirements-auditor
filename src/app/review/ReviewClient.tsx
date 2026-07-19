'use client';

import { useMemo, useState } from 'react';
import { Badge, Box, Button, Grid, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { type Finding, type FindingStatus } from '@/lib/findings';
import { type ReviewDecision } from '@/lib/store';
import { type Role } from '@/lib/session';
import { FindingCard } from '@/components/FindingCard';
import { type Lang, translations } from '@/lib/i18n';

interface ReviewState {
  status: FindingStatus;
  note: string;
  decidedAt?: string;
  persisted: boolean;
}

export default function ReviewClient({
  initialFindings,
  runTarget,
  role,
  persisted,
  lang = 'en',
}: {
  initialFindings: Finding[];
  runTarget: string;
  role: Role;
  persisted: ReviewDecision[];
  lang?: Lang;
}) {
  const t = translations[lang].review;
  const [reviews, setReviews] = useState<Record<string, ReviewState>>(() => {
    const byId = new Map(persisted.map(d => [d.findingId, d]));
    return Object.fromEntries(
      initialFindings.map(f => {
        const saved = byId.get(f.id);
        return [
          f.id,
          saved
            ? {
                status: saved.status,
                note: saved.note ?? '',
                decidedAt: saved.decidedAt,
                persisted: true,
              }
            : { status: 'proposed' as const, note: '', persisted: false },
        ];
      })
    );
  });
  const [saveError, setSaveError] = useState(false);

  const counts = useMemo(() => {
    const values = Object.values(reviews);
    return {
      approved: values.filter(r => r.status === 'approved').length,
      rejected: values.filter(r => r.status === 'rejected').length,
      pending: values.filter(r => r.status === 'proposed').length,
    };
  }, [reviews]);

  function decide(id: string, status: FindingStatus) {
    const previous = reviews[id];
    const next: ReviewState = {
      ...previous,
      status,
      decidedAt: new Date().toISOString(),
      persisted: false,
    };
    setReviews(prev => ({ ...prev, [id]: next }));
    if (role !== 'reviewer') return;

    void fetch('/api/review', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        findingId: id,
        runTarget,
        status,
        note: next.note || undefined,
      }),
    })
      .then(response => {
        if (!response.ok) throw new Error('save_failed');
        setSaveError(false);
        // A reset removes the durable record, so nothing is "saved" after it.
        setReviews(prev => ({
          ...prev,
          [id]: { ...prev[id], persisted: status !== 'proposed' },
        }));
      })
      .catch(() => {
        setSaveError(true);
        setReviews(prev => ({ ...prev, [id]: previous }));
      });
  }

  function setNote(id: string, note: string) {
    setReviews(prev => ({ ...prev, [id]: { ...prev[id], note } }));
  }

  return (
    <Stack gap="6">
      {saveError && (
        <Box
          role="alert"
          borderWidth="1px"
          borderColor="warn.line"
          bg="warn.bg"
          rounded="xl"
          px="5"
          py="3"
        >
          <Text fontSize="sm" color="warn.fg">
            {t.saveError}
          </Text>
        </Box>
      )}

      <Grid templateColumns="repeat(3, 1fr)" gap="3">
        <Tally label={t.approved} value={counts.approved} palette="green" />
        <Tally label={t.rejected} value={counts.rejected} palette="red" />
        <Tally label={t.pending} value={counts.pending} palette="orange" />
      </Grid>

      <Stack gap="4">
        {initialFindings.map(finding => {
          const review = reviews[finding.id];
          const merged: Finding = { ...finding, status: review.status, reviewerNote: review.note };
          return (
            <FindingCard
              key={finding.id}
              finding={merged}
              lang={lang}
              actions={
                <Stack gap="3">
                  <HStack gap="2" flexWrap="wrap">
                    <Button
                      size="sm"
                      variant={review.status === 'approved' ? 'solid' : 'outline'}
                      colorPalette="green"
                      onClick={() => decide(finding.id, 'approved')}
                    >
                      {t.approve}
                    </Button>
                    <Button
                      size="sm"
                      variant={review.status === 'rejected' ? 'solid' : 'outline'}
                      colorPalette="red"
                      onClick={() => decide(finding.id, 'rejected')}
                    >
                      {t.reject}
                    </Button>
                    {review.status !== 'proposed' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        color="fg.subtle"
                        onClick={() => decide(finding.id, 'proposed')}
                      >
                        {t.reset}
                      </Button>
                    )}
                    {review.persisted && (
                      <Badge colorPalette="teal" variant="subtle" rounded="full">
                        {t.saved}
                      </Badge>
                    )}
                  </HStack>
                  <Input
                    value={review.note}
                    onChange={e => setNote(finding.id, e.target.value)}
                    placeholder={t.notePlaceholder}
                    aria-label={t.noteAria(finding.id)}
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

      <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="2xl" p="5">
        <Text fontSize="sm" fontWeight="medium" color="fg.default" mb="3">
          {t.trail}
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
                  rounded="full"
                >
                  {review.status === 'proposed'
                    ? t.pending.toLowerCase()
                    : (translations[lang].finding.status[review.status] ?? review.status)}
                </Badge>
                <Text fontFamily="heading" color="accent.fg">
                  {finding.requirementId}
                </Text>
                <Text color="fg.muted">{finding.filePath}</Text>
                {review.decidedAt && (
                  <Text fontFamily="heading" color="fg.subtle">
                    {review.decidedAt.slice(0, 16).replace('T', ' ')}
                    {review.persisted ? t.trailSaved : t.trailSession}
                  </Text>
                )}
                {review.note && (
                  <Text color="fg.subtle">
                    {t.notePrefix} {review.note}
                  </Text>
                )}
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
