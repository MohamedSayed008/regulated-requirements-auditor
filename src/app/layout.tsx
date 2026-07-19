import type { Metadata } from 'next';
import { type ReactNode } from 'react';
import { Geist, Geist_Mono, Spectral, Amiri } from 'next/font/google';
import { Box } from '@chakra-ui/react';
import { Provider } from '@/components/ui/provider';
import { LocaleHtml } from '@/components/ui/LocaleHtml';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { siteConfig, siteJsonLd } from '@/lib/site';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// The law voice (serif) and the bilingual display face (Arabic).
const spectral = Spectral({
  variable: '--font-spectral',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const amiri = Amiri({
  variable: '--font-amiri',
  weight: ['400', '700'],
  subsets: ['arabic', 'latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.author, url: siteConfig.authorUrl }],
  creator: siteConfig.author,
  alternates: {
    canonical: '/',
    languages: { 'en-US': '/', ar: '/ar', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${spectral.variable} ${amiri.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          // Controlled config serialized to JSON, never user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()) }}
        />
        <Provider>
          <LocaleHtml />
          {/* Persistent app shell: nav + footer render once and survive
              navigation; only <main> swaps (and shows loading.tsx) per route. */}
          <Box
            minH="100dvh"
            display="flex"
            flexDirection="column"
            bg="bg.canvas"
            backgroundImage="radial-gradient(120% 90% at 85% -10%, rgba(230, 205, 134, 0.07), transparent 55%), radial-gradient(90% 70% at 5% 110%, rgba(15, 118, 110, 0.10), transparent 55%)"
            transition="background 0.3s"
          >
            <Nav />
            <Box as="main" flex="1">
              {children}
            </Box>
            <Footer />
          </Box>
        </Provider>
      </body>
    </html>
  );
}
