import type { Metadata } from 'next';
import RequirementsPage from '@/app/requirements/page';

export const metadata: Metadata = {
  title: 'المتطلبات',
  description: 'المدونات: تشريعات مفككة إلى وحدات متطلبات قابلة للاستشهاد، بالعربية والإنجليزية.',
  alternates: {
    canonical: '/ar/requirements',
    languages: { 'en-US': '/requirements', ar: '/ar/requirements', 'x-default': '/requirements' },
  },
};

export default function ArRequirementsPage() {
  return <RequirementsPage lang="ar" />;
}
