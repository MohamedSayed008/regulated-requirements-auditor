import type { Metadata } from 'next';
import ReadinessPage from '@/app/readiness/page';

export const metadata: Metadata = {
  title: 'جاهزية الفوترة الإلكترونية',
  description:
    'افحص فاتورة مقابل تفويض الفوترة الإلكترونية في الإمارات: تحقق من الحقول مع استشهاد بالمتطلب الوزاري لكل ثغرة.',
  alternates: {
    canonical: '/ar/readiness',
    languages: { 'en-US': '/readiness', ar: '/ar/readiness', 'x-default': '/readiness' },
  },
};

export default function ArReadinessPage() {
  return <ReadinessPage lang="ar" />;
}
