import type { Metadata } from 'next';
import ActivityPage from '@/app/activity/page';

export const metadata: Metadata = {
  title: 'النشاط',
  description:
    'سجل التدقيق المباشر: كل سؤال وكل تشغيلة تدقيق وكل قرار مراجعة، مع استهلاك الرموز وإجمالي التكلفة.',
  alternates: {
    canonical: '/ar/activity',
    languages: { 'en-US': '/activity', ar: '/ar/activity', 'x-default': '/activity' },
  },
};

// The log is per-request data, never build-time.
export const dynamic = 'force-dynamic';

export default function ArActivityPage() {
  return <ActivityPage lang="ar" />;
}
