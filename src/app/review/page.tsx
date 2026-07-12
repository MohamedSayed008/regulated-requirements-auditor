import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { auditRunSchema } from '@/lib/findings';
import { SEVERITY_ORDER } from '@/lib/severity';
import { SESSION_COOKIE } from '@/lib/session';
import { resolveRole } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { Page } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import ReviewClient from '@/app/review/ReviewClient';
import runJson from '@/data/audit/latest-run.json';

export const metadata: Metadata = {
  title: 'Review queue',
  description:
    'The human-in-the-loop step: approve or reject each proposed finding before it counts.',
  alternates: { canonical: '/review' },
};

const run = auditRunSchema.parse(runJson);
const findings = [...run.findings].sort(
  (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
);

// Decisions and the role are per-request, not build-time.
export const dynamic = 'force-dynamic';

export default async function ReviewPage() {
  const cookieStore = await cookies();
  const role = await resolveRole(cookieStore.get(SESSION_COOKIE)?.value);
  const persisted = await getStore()
    .listDecisions(run.target)
    .catch(() => []);

  return (
    <Page>
      <PageHeader eyebrow="Human approval" title="Review queue" maxW="62ch">
        The AI proposes, a human decides. Each finding below is a proposal, not a verdict.
        {role === 'reviewer'
          ? ' You are signed in as the reviewer: decisions persist to the audit trail.'
          : ' Approve or reject to try the workflow; as a visitor your decisions stay in this session only, while the signed reviewer decisions below are the durable record.'}
      </PageHeader>
      <Reveal delay={160}>
        <ReviewClient
          initialFindings={findings}
          runTarget={run.target}
          role={role}
          persisted={persisted}
        />
      </Reveal>
    </Page>
  );
}
