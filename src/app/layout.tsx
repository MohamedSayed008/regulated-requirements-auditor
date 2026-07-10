import type { Metadata } from 'next';
import { type ReactNode } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import { Provider } from '@/components/ui/provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mizan: Regulated Requirements Auditor',
  description:
    'Governed agentic AI for regulated workflows: requirement documents answered with citations, code audited against them, findings human-approved, evals published.',
  robots: { index: false },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
