import type { Metadata } from 'next';
import AuditRepoPage from '@/app/audit-repo/page';

export const metadata: Metadata = {
  title: 'دقق مستودعاً',
  description: 'دقق أي مستودع GitHub عام مقابل تشريع مختار، عبر خط الملاحظات المحوكم نفسه.',
  alternates: {
    canonical: '/ar/audit-repo',
    languages: { 'en-US': '/audit-repo', ar: '/ar/audit-repo', 'x-default': '/audit-repo' },
  },
};

export default function ArAuditRepoPage() {
  return <AuditRepoPage lang="ar" />;
}
