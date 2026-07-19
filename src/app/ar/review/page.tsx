import type { Metadata } from 'next';
import ReviewPage from '@/app/review/page';

export const metadata: Metadata = {
  title: 'قائمة المراجعة',
  description: 'خطوة الإنسان في الحلقة: اعتمد أو ارفض كل ملاحظة مقترحة قبل أن يُعتد بها.',
  alternates: {
    canonical: '/ar/review',
    languages: { 'en-US': '/review', ar: '/ar/review', 'x-default': '/review' },
  },
};

// Decisions and the role are per-request, not build-time.
export const dynamic = 'force-dynamic';

export default function ArReviewPage() {
  return <ReviewPage lang="ar" />;
}
