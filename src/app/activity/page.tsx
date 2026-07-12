import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Badge, Box, Grid, HStack, Stack, Text } from '@chakra-ui/react';
import { SESSION_COOKIE } from '@/lib/session';
import { resolveRole } from '@/lib/auth';
import { type AuditLogEntry, fromMicros, getStore } from '@/lib/store';
import { Page } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';

export const metadata: Metadata = {
  title: 'Activity',
  description:
    'The live audit log: every question, audit run, and review decision, with token usage and cost totals.',
  alternates: { canonical: '/activity' },
};

// The log is per-request data, never build-time.
export const dynamic = 'force-dynamic';

const ACTION_LABEL: Record<AuditLogEntry['action'], string> = {
  ask: 'question asked',
  audit_repo: 'repo audited',
  review_decide: 'decision recorded',
};

const ACTION_PALETTE: Record<AuditLogEntry['action'], string> = {
  ask: 'teal',
  audit_repo: 'yellow',
  review_decide: 'green',
};

export default async function ActivityPage() {
  const cookieStore = await cookies();
  const role = await resolveRole(cookieStore.get(SESSION_COOKIE)?.value);
  const store = getStore();
  const [totals, events] = await Promise.all([
    store.getTotals().catch(() => null),
    store.listLog(60).catch(() => [] as AuditLogEntry[]),
  ]);

  return (
    <Page>
      <PageHeader eyebrow="The audit trail" title="Activity" maxW="64ch">
        A governed system should be auditable, so the log is public: every question, audit run, and
        review decision, with what it cost. Event payloads are visible to the signed-in reviewer;
        visitors see the shape of the activity without its contents.
      </PageHeader>

      {totals && (
        <Reveal delay={120}>
          <Grid
            templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
            gap="3.5"
            mb="10"
          >
            <Stat value={String(totals.askCount)} label="questions asked" />
            <Stat value={String(totals.auditRepoCount)} label="repos audited" />
            <Stat value={String(totals.decisionCount)} label="decisions recorded" />
            <Stat
              value={`$${fromMicros(totals.costMicros).toFixed(4)}`}
              label={`total model spend · ${totals.inputTokens.toLocaleString()} in / ${totals.outputTokens.toLocaleString()} out tokens`}
              color="law.fg"
            />
          </Grid>
        </Reveal>
      )}

      <Reveal delay={180}>
        <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="2xl" p="5">
          <HStack justify="space-between" mb="4" flexWrap="wrap">
            <Text fontSize="sm" fontWeight="medium" color="fg.default">
              Recent events
            </Text>
            <Badge
              colorPalette={role === 'reviewer' ? 'green' : 'gray'}
              variant="subtle"
              rounded="full"
            >
              {role === 'reviewer' ? 'reviewer view: full detail' : 'public view: details masked'}
            </Badge>
          </HStack>
          {events.length === 0 && (
            <Text fontSize="sm" color="fg.muted">
              No recorded activity yet. Ask a question or audit a repo and it will appear here.
            </Text>
          )}
          <Stack gap="2.5">
            {events.map((event, i) => (
              <HStack key={`${event.ts}-${i}`} gap="3" fontSize="xs" flexWrap="wrap">
                <Text fontFamily="heading" color="fg.subtle" minW="18ch">
                  {event.ts.slice(0, 16).replace('T', ' ')}
                </Text>
                <Badge colorPalette={ACTION_PALETTE[event.action]} variant="subtle" rounded="full">
                  {ACTION_LABEL[event.action]}
                </Badge>
                {event.corpusId && (
                  <Text fontFamily="heading" color="accent.fg">
                    {event.corpusId}
                  </Text>
                )}
                {typeof event.costMicros === 'number' && event.costMicros > 0 && (
                  <Text fontFamily="heading" color="law.fg">
                    ${fromMicros(event.costMicros).toFixed(4)}
                  </Text>
                )}
                <Text color="fg.muted" flex="1" minW="20ch">
                  {role === 'reviewer' ? event.detail : maskedDetail(event)}
                </Text>
              </HStack>
            ))}
          </Stack>
        </Box>
      </Reveal>
    </Page>
  );
}

/** What the public sees in place of a payload that may carry user input. */
function maskedDetail(event: AuditLogEntry): string {
  if (event.action === 'ask') return 'question content visible to the reviewer';
  if (event.action === 'audit_repo') return 'repository and findings visible to the reviewer';
  return 'decision detail visible to the reviewer';
}

function Stat({
  value,
  label,
  color = 'fg.default',
}: {
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <Box borderWidth="1px" borderColor="border.default" bg="bg.panel" rounded="xl" p="4.5">
      <Text fontFamily="heading" fontSize="2xl" color={color}>
        {value}
      </Text>
      <Text fontSize="xs" color="fg.subtle" mt="1">
        {label}
      </Text>
    </Box>
  );
}
