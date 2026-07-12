import type { Metadata } from 'next';
import { Heading, Stack, Text } from '@chakra-ui/react';
import { auditRunSchema } from '@/lib/findings';
import { SEVERITY_ORDER } from '@/lib/severity';
import { Page } from '@/components/ui/shell';
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
      <Stack gap="4" mb="8">
        <Text
          fontSize="sm"
          fontWeight="semibold"
          letterSpacing="0.2em"
          textTransform="uppercase"
          color="accent.fg"
        >
          Human approval
        </Text>
        <Heading fontFamily="serif" fontWeight="500" fontSize="3xl">
          Review queue
        </Heading>
        <Text color="fg.muted" maxW="2xl">
          The AI proposes, a human decides. Each finding below is a proposal, not a verdict. Approve
          the ones that hold up, reject the ones that do not, and leave a note. Nothing here is
          saved: this is a demo of the workflow, and your decisions reset with the session.
        </Text>
      </Stack>
      <ReviewClient initialFindings={findings} />
    </Page>
  );
}
