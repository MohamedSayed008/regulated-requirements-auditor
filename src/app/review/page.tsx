import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { type FindingProseAr, applyProseOverlay, auditRunSchema } from '@/lib/findings';
import { SEVERITY_ORDER } from '@/lib/severity';
import { SESSION_COOKIE } from '@/lib/session';
import { resolveRole } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { Page } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import { type Lang, translations } from '@/lib/i18n';
import ReviewClient from '@/app/review/ReviewClient';
import runJson from '@/data/audit/latest-run.json';
import arProse from '@/data/audit/latest-run-ar.json';

export const metadata: Metadata = {
  title: 'Review queue',
  description:
    'The human-in-the-loop step: approve or reject each proposed finding before it counts.',
  alternates: {
    canonical: '/review',
    languages: { 'en-US': '/review', ar: '/ar/review', 'x-default': '/review' },
  },
};

const run = auditRunSchema.parse(runJson);
const findings = [...run.findings].sort(
  (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
);

// Decisions and the role are per-request, not build-time.
export const dynamic = 'force-dynamic';

export default async function ReviewPage({ lang = 'en' }: { lang?: Lang }) {
  const t = translations[lang].review;
  const cookieStore = await cookies();
  const role = await resolveRole(cookieStore.get(SESSION_COOKIE)?.value);
  const persisted = await getStore()
    .listDecisions(run.target)
    .catch(() => []);

  return (
    <Page lang={lang}>
      <PageHeader eyebrow={t.eyebrow} title={t.title} maxW="62ch" lang={lang}>
        {t.ledeBase}
        {role === 'reviewer' ? t.ledeReviewer : t.ledeVisitor}
      </PageHeader>
      <Reveal delay={160}>
        <ReviewClient
          initialFindings={
            lang === 'ar'
              ? applyProseOverlay(findings, arProse as Record<string, FindingProseAr>)
              : findings
          }
          runTarget={run.target}
          role={role}
          persisted={persisted}
          lang={lang}
        />
      </Reveal>
    </Page>
  );
}
