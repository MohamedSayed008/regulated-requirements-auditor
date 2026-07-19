import type { Metadata } from 'next';
import AuditPage from '@/app/audit/page';

export const metadata: Metadata = {
  title: 'التدقيق',
  description:
    'تدقيق كود معاد التشغيل: تطبيق لإدارة الإيجارات مفحوص مقابل قانون إيجارات دبي، وكل ملاحظة مربوطة بالمادة التي يخالفها.',
  alternates: {
    canonical: '/ar/audit',
    languages: { 'en-US': '/audit', ar: '/ar/audit', 'x-default': '/audit' },
  },
};

export default function ArAuditPage() {
  return <AuditPage lang="ar" />;
}
