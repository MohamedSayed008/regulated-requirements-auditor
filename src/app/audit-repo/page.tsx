import type { Metadata } from 'next';
import { Page } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import { CORPUS_LIST, DEFAULT_CORPUS_ID } from '@/lib/corpora';
import { type Lang, translations } from '@/lib/i18n';
import AuditRepoClient from '@/app/audit-repo/AuditRepoClient';

export const metadata: Metadata = {
  title: 'Audit a repo',
  description:
    'Audit any public GitHub repository against a chosen regulation, through the same governed findings pipeline.',
  alternates: {
    canonical: '/audit-repo',
    languages: { 'en-US': '/audit-repo', ar: '/ar/audit-repo', 'x-default': '/audit-repo' },
  },
};

export default function AuditRepoPage({ lang = 'en' }: { lang?: Lang }) {
  const t = translations[lang].auditRepo;
  return (
    <Page maxW="4xl" lang={lang}>
      <PageHeader eyebrow={t.eyebrow} title={t.title} maxW="62ch" lang={lang}>
        {t.lede}
      </PageHeader>
      <Reveal delay={160}>
        <AuditRepoClient
          corpusOptions={CORPUS_LIST.map(c => ({ id: c.id, shortName: c.shortName }))}
          defaultCorpusId={DEFAULT_CORPUS_ID}
          lang={lang}
        />
      </Reveal>
    </Page>
  );
}
