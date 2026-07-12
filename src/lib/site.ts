/**
 * Single source of truth for site-wide identity and SEO. Everything that needs
 * the canonical URL, name, description, or structured data reads from here:
 * layout metadata, sitemap, robots, and the OG image. The production URL comes
 * from NEXT_PUBLIC_SITE_URL and falls back to the live domain.
 */

export const siteConfig = {
  name: 'Mizan',
  title: 'Mizan: Regulated Requirements Auditor',
  description:
    'Governed agentic AI for regulated workflows: regulations answered with clause-level citations, code audited against them, findings human-approved, and evals published. Live on Dubai tenancy law and the UAE eInvoicing mandate.',
  tagline: 'Reads the regulation, answers with citations, and audits code against it.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://audit.mohamedattwa.com',
  author: 'Mohamed Sayed',
  authorUrl: 'https://mohamedattwa.com',
  repo: 'https://github.com/MohamedSayed008/regulated-requirements-auditor',
  keywords: [
    'regulated AI',
    'RegTech',
    'AI compliance',
    'citations',
    'human in the loop',
    'eInvoicing',
    'UAE',
    'Dubai tenancy law',
    'agentic AI',
    'requirements auditor',
    'LLM evals',
  ],
} as const;

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = '/'): string {
  return new URL(path, siteConfig.url).toString();
}

/**
 * Structured data (schema.org) injected once in the root layout. It is a
 * SoftwareApplication described by its author, wrapped in a @graph so the
 * WebSite, the app, and the Person all cross-reference by id. Controlled config
 * only, never user input.
 */
export function siteJsonLd() {
  const personId = `${siteConfig.url}/#author`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        inLanguage: ['en', 'ar'],
        publisher: { '@id': personId },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteConfig.url}/#app`,
        name: siteConfig.title,
        url: siteConfig.url,
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'RegTech',
        operatingSystem: 'Web',
        description: siteConfig.description,
        inLanguage: ['en', 'ar'],
        author: { '@id': personId },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'Person',
        '@id': personId,
        name: siteConfig.author,
        url: siteConfig.authorUrl,
        sameAs: [siteConfig.repo],
      },
    ],
  };
}
