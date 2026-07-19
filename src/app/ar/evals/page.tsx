import type { Metadata } from 'next';
import EvalsPage from '@/app/evals/page';

export const metadata: Metadata = {
  title: 'التقييمات',
  description:
    'تقرير التقييم المنشور لكل مدونة: التأسيس على المصادر، وصحة الرفض، ومقاومة الحقن، ودقة واستدعاء التدقيق.',
  alternates: {
    canonical: '/ar/evals',
    languages: { 'en-US': '/evals', ar: '/ar/evals', 'x-default': '/evals' },
  },
};

export default function ArEvalsPage() {
  return <EvalsPage lang="ar" />;
}
