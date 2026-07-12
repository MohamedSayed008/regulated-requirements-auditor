import type { Metadata } from 'next';
import { Page } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import { CORPUS_LIST, DEFAULT_CORPUS_ID } from '@/lib/corpora';
import AuditRepoClient from '@/app/audit-repo/AuditRepoClient';

export const metadata: Metadata = {
  title: 'Audit a repo',
  description:
    'Audit any public GitHub repository against a chosen regulation, through the same governed findings pipeline.',
  alternates: { canonical: '/audit-repo' },
};

export default function AuditRepoPage() {
  return (
    <Page maxW="4xl">
      <PageHeader eyebrow="Audit your code" title="Audit a public repo against the law" maxW="62ch">
        Paste a public GitHub repository URL and pick a corpus. Mizan fetches a bounded set of
        source files and audits them, raising findings tied to the requirement they violate. For
        unrelated code it will honestly report nothing applicable.
      </PageHeader>
      <Reveal delay={160}>
        <AuditRepoClient
          corpusOptions={CORPUS_LIST.map(c => ({ id: c.id, shortName: c.shortName }))}
          defaultCorpusId={DEFAULT_CORPUS_ID}
        />
      </Reveal>
    </Page>
  );
}
