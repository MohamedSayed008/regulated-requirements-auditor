import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

// Every indexable route. All are canonical and public; none are noindex.
const BASE_ROUTES: { path: string; priority: number }[] = [
  { path: '/', priority: 1 },
  { path: '/ask', priority: 0.9 },
  { path: '/audit', priority: 0.9 },
  { path: '/audit-repo', priority: 0.8 },
  { path: '/readiness', priority: 0.8 },
  { path: '/evals', priority: 0.8 },
  { path: '/requirements', priority: 0.7 },
  { path: '/review', priority: 0.6 },
  { path: '/activity', priority: 0.5 },
];

// Each route ships in English at / and Arabic at /ar (hreflang pairs are in
// per-page metadata). Arabic entries carry a slightly lower priority.
const ROUTES = BASE_ROUTES.flatMap(({ path, priority }) => [
  { path, priority },
  { path: path === '/' ? '/ar' : `/ar${path}`, priority: Math.max(0.1, priority - 0.1) },
]);

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(({ path, priority }) => ({
    url: absoluteUrl(path),
    changeFrequency: 'monthly',
    priority,
  }));
}
