import type { Metadata } from 'next';
import Home from '@/app/page';

export const metadata: Metadata = {
  title: 'ميزان: مدقق المتطلبات المحوكم',
  description:
    'مدقق متطلبات بالذكاء الاصطناعي يقرأ القانون ويستشهد بالمادة ويزن الكود في ميزانه. يعمل على قانون إيجارات دبي وتفويض الفوترة الإلكترونية في الإمارات.',
  alternates: {
    canonical: '/ar',
    languages: { 'en-US': '/', ar: '/ar', 'x-default': '/' },
  },
};

export default function ArHome() {
  return <Home lang="ar" />;
}
