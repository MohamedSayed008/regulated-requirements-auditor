export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neutral-950 px-6 text-center text-neutral-100">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-400">Coming soon</p>
      <h1 className="max-w-2xl font-mono text-4xl font-bold sm:text-5xl">
        Mizan <span className="text-neutral-500">ميزان</span>
      </h1>
      <p className="max-w-xl text-lg text-neutral-400">
        A regulated requirements auditor: ask questions about the regulation and get the exact
        clause cited, audit code against the requirements, and approve every finding before it
        counts. Evals published with every release.
      </p>
      <p className="text-sm text-neutral-600">
        No citation, no answer. No human approval, no finding.
      </p>
      <a
        href="/requirements"
        className="rounded-lg border border-teal-800 bg-teal-950 px-4 py-2 text-sm font-semibold text-teal-300 transition-colors hover:bg-teal-900"
      >
        Browse the corpus: Dubai tenancy law
      </a>
    </main>
  );
}
