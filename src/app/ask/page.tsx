import type { Metadata } from 'next';
import AskClient from '@/app/ask/AskClient';

export const metadata: Metadata = {
  title: 'Ask: Mizan',
  description: 'Ask questions about Dubai tenancy law and get answers with the exact clause cited.',
};

export default function AskPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-neutral-950 px-6 py-16 text-neutral-100">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-400">
          Ask with citations
        </p>
        <h1 className="mt-2 font-mono text-3xl font-bold">Ask the regulation</h1>
        <p className="mt-4 max-w-xl text-neutral-400">
          Questions are answered only from the corpus, and every claim carries a citation that links
          to the exact requirement unit. Ask in English or Arabic. If the corpus does not cover it,
          the answer says so: refusal is a feature.
        </p>
      </header>
      <AskClient />
      <p className="mt-10 text-xs text-neutral-600">
        Demo only, not legal advice. In case of conflict the Arabic text of the law prevails.
      </p>
    </main>
  );
}
