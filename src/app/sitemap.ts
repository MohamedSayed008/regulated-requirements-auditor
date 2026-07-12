import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

// Every indexable route. All are canonical and public; none are noindex.
const ROUTES: { path: string; priority: number }[] = [
  { path: '/', priority: 1 },
  { path: '/ask', priority: 0.9 },
  { path: '/audit', priority: 0.9 },
  { path: '/audit-repo', priority: 0.8 },
  { path: '/evals', priority: 0.8 },
  { path: '/requirements', priority: 0.7 },
  { path: '/review', priority: 0.6 },
  { path: '/activity', priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(({ path, priority }) => ({
    url: absoluteUrl(path),
    changeFrequency: 'monthly',
    priority,
  }));
}
