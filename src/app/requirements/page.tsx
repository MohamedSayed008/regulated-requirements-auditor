import type { Metadata } from 'next';
import {
  CORPUS_CURRENCY,
  CORPUS_DISCLAIMER,
  type CorpusDocument,
  type RequirementUnit,
  corpusDocumentSchema,
  parseCorpus,
} from '@/lib/corpus';
import documentsJson from '@/data/corpus/documents.json';
import law26Json from '@/data/corpus/law-26-2007.json';
import decree43Json from '@/data/corpus/decree-43-2013.json';

export const metadata: Metadata = {
  title: 'Requirements: Mizan',
  description:
    'The corpus: Dubai tenancy law parsed into citable requirement units, English and Arabic.',
};

const documents = documentsJson.map(d => corpusDocumentSchema.parse(d));
const unitsBySource = new Map<string, RequirementUnit[]>([
  ['LAW26-2007', parseCorpus(law26Json)],
  ['DEC43-2013', parseCorpus(decree43Json)],
]);

export default function RequirementsPage() {
  const total = [...unitsBySource.values()].reduce((sum, units) => sum + units.length, 0);
  const testable = [...unitsBySource.values()].flat().filter(unit => unit.testable).length;

  return (
    <main className="mx-auto min-h-screen max-w-4xl bg-neutral-950 px-6 py-16 text-neutral-100">
      <header className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-400">The corpus</p>
        <h1 className="mt-2 font-mono text-3xl font-bold">Requirements</h1>
        <p className="mt-4 max-w-2xl text-neutral-400">
          Dubai tenancy law parsed into {total} citable requirement units, {testable} of them
          testable against code. Every answer and every audit finding in this demo points back to
          one of the units below.
        </p>
        <div className="mt-6 space-y-1 rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-xs text-neutral-500">
          <p>{CORPUS_DISCLAIMER.en}</p>
          <p dir="rtl" lang="ar">
            {CORPUS_DISCLAIMER.ar}
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-xs text-neutral-500">
          <p>{CORPUS_CURRENCY.note}</p>
        </div>
      </header>

      {documents.map(doc => (
        <DocumentSection key={doc.slug} doc={doc} units={unitsBySource.get(doc.slug) ?? []} />
      ))}
    </main>
  );
}

function DocumentSection({ doc, units }: { doc: CorpusDocument; units: RequirementUnit[] }) {
  return (
    <section aria-labelledby={doc.slug} className="mb-14">
      <h2 id={doc.slug} className="border-b border-neutral-800 pb-3 text-xl font-semibold">
        {doc.titleEn}
      </h2>
      <p className="mt-2 text-sm text-neutral-500">
        <span dir="rtl" lang="ar">
          {doc.titleAr}
        </span>
        {doc.amendedBy && <span> · as amended by {doc.amendedBy}</span>} ·{' '}
        <a
          href={doc.officialSourceEn}
          className="text-teal-400 underline-offset-2 hover:underline"
          rel="noopener noreferrer"
        >
          official source
        </a>
      </p>
      <ul className="mt-6 space-y-4">
        {units.map(unit => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </ul>
    </section>
  );
}

function UnitCard({ unit }: { unit: RequirementUnit }) {
  return (
    <li
      id={unit.id}
      className="scroll-mt-24 rounded-xl border border-neutral-800 bg-neutral-900 p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <code className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-xs text-teal-300">
          {unit.id}
        </code>
        <span className="text-sm font-medium text-neutral-300">{unit.articleRef}</span>
        {unit.testable && (
          <span className="rounded-full border border-teal-700 bg-teal-950 px-2 py-0.5 text-xs font-semibold text-teal-400">
            testable
          </span>
        )}
        {unit.amendedBy && (
          <span className="rounded-full border border-amber-700 bg-amber-950 px-2 py-0.5 text-xs font-semibold text-amber-400">
            amended by Law 33/2008
          </span>
        )}
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-300">
        {unit.textEn}
      </p>
      <p
        dir="rtl"
        lang="ar"
        className="mt-3 whitespace-pre-line border-s-2 border-neutral-800 ps-4 text-sm leading-relaxed text-neutral-400"
      >
        {unit.textAr}
      </p>
      {unit.editorialNote && (
        <p className="mt-3 rounded-lg border border-amber-900 bg-amber-950/40 px-3 py-2 text-xs text-amber-300">
          Editorial note: {unit.editorialNote}
        </p>
      )}
      {unit.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {unit.tags.map(tag => (
            <span key={tag} className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-500">
              {tag}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}
