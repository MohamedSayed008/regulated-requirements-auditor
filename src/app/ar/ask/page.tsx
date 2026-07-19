import type { Metadata } from 'next';
import AskPage from '@/app/ask/page';

export const metadata: Metadata = {
  title: 'اسأل',
  description:
    'اسأل التشريع واحصل على إجابة مستشهد فيها بالمادة بعينها. يعمل على قانون إيجارات دبي وتفويض الفوترة الإلكترونية في الإمارات.',
  alternates: {
    canonical: '/ar/ask',
    languages: { 'en-US': '/ask', ar: '/ar/ask', 'x-default': '/ask' },
  },
};

export default function ArAskPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <AskPage searchParams={searchParams} lang="ar" />;
}
