import type { Metadata } from 'next';
import { Heading, Stack, Text } from '@chakra-ui/react';
import { Page } from '@/components/ui/shell';
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
    <Page>
      <Stack gap="4" mb="8">
        <Text
          fontSize="sm"
          fontWeight="semibold"
          letterSpacing="0.2em"
          textTransform="uppercase"
          color="accent.fg"
        >
          Audit your code
        </Text>
        <Heading fontFamily="serif" fontWeight="500" fontSize="3xl">
          Audit a public repo against the law
        </Heading>
        <Text color="fg.muted" maxW="2xl">
          Paste a public GitHub repository URL and pick a corpus. Mizan fetches a bounded set of its
          source files and audits them against that corpus, raising findings tied to the requirement
          they violate. This is most meaningful when the code matches the corpus, tenancy or
          property software for the tenancy law, invoicing or ERP software for eInvoicing; for
          unrelated code it will honestly report nothing applicable.
        </Text>
      </Stack>
      <AuditRepoClient
        corpusOptions={CORPUS_LIST.map(c => ({ id: c.id, shortName: c.shortName }))}
        defaultCorpusId={DEFAULT_CORPUS_ID}
      />
      <Text mt="10" fontSize="xs" color="fg.subtle">
        Only public repositories, up to 12 source files. AI-generated findings, not legal advice.
      </Text>
    </Page>
  );
}
