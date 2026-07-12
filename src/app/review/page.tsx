import type { Metadata } from 'next';
import { auditRunSchema } from '@/lib/findings';
import { SEVERITY_ORDER } from '@/lib/severity';
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

export default function ReviewPage() {
  return (
    <Page>
      <PageHeader eyebrow="Human approval" title="Review queue" maxW="62ch">
        The AI proposes, a human decides. Each finding below is a proposal, not a verdict. Approve
        the ones that hold up, reject the ones that do not, and leave a note. Nothing here is saved:
        this is a demo of the workflow, and your decisions reset with the session.
      </PageHeader>
      <Reveal delay={160}>
        <ReviewClient initialFindings={findings} />
      </Reveal>
    </Page>
  );
}
