# Mizan — Regulated Requirements Auditor

> ميزان, "the scale". Live demo: [audit.mohamedattwa.com](https://audit.mohamedattwa.com)

An AI workflow application for regulated, document-heavy processes. Mizan reads
a regulation, answers questions about it with clause-level citations, audits
code against the requirements, raises structured findings, and requires human
approval before anything counts. Every release ships with a published
evaluation report.

It is a public rebuild of a requirements-auditing engine I first shipped at
Dubai Land Department, where a custom skill turned Business Requirement
Documents into a queryable, code-aware knowledge base across four repositories.

**The thesis it proves:** not "uses AI tools" but "builds the systems that make
AI output reliable in a regulated codebase." No citation, no answer. No human
approval, no finding. No eval report, no release.

## What it does

| Capability                 | Where         | How it works                                                                                                                                                                                                                                   |
| -------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ask with citations**     | `/ask`        | Grounded Q&A over the corpus via the Claude Citations API. Citations come from the model's citation output, not prompt engineering. Out-of-corpus questions are refused, and the refusal is eval-tested. English and Arabic.                   |
| **Audit code vs. the law** | `/audit`      | An agent audits a tenancy-management app against the testable requirements and emits Zod-validated findings, each tied to the clause it violates with file and line references. The run has a visible governance trace and exports to PDF/CSV. |
| **Audit any repo**         | `/audit-repo` | Point it at a public GitHub repo and it fetches the source (with size and file-count limits) and audits it against a chosen corpus, through the same governed findings pipeline.                                                               |
| **Human approval**         | `/review`     | Findings are proposed, never final. A reviewer sees the clause and the code side by side, approves or rejects with a note, and gets a decision trail.                                                                                          |
| **Published evals**        | `/evals`      | Groundedness, refusal correctness, prompt-injection resistance, and audit precision/recall against a seeded ground truth, per corpus. Graders are programmatic, so the numbers are reproducible.                                               |

## The corpora

The corpus registry makes each regulation one entry; the ask, audit, and eval
engines are parameterized by corpus id. Two corpora are live.

### Dubai tenancy law

Parsed into 49 citable requirement units, English and Arabic:

- **Law No. (26) of 2007** regulating the landlord-tenant relationship, as
  amended by **Law No. (33) of 2008** (11 articles replaced; the consolidated
  post-amendment text is used and flagged).
- **Decree No. (43) of 2013** on rent-increase caps (the five slabs are
  clause-level units).

Every unit carries the verbatim official English and Arabic text from the Dubai
Legislation Portal, with a stable citable id (e.g. `LAW26-2007/ART-14`). The
currency of the corpus was independently verified as of July 2026. Two honest
findings from verifying fidelity against the source are preserved as editorial
notes: the official English of Article 16 contains a typo (kept verbatim), and
the authentic Arabic of Article 26 contains a clause the official English
translation omits — a concrete reason the app renders both languages and shows
an "Arabic prevails" disclaimer.

### UAE eInvoicing mandate

The Ministry of Finance eInvoicing rules, parsed into 30 units (18 testable),
English (matching the source): Ministerial Decisions 243 and 244 of 2025, the
mandatory-fields data dictionary, and Cabinet Decision 106 of 2025 on penalties.
The seeded audit target is a small invoicing app with planted violations
(PDF-not-structured, missing buyer TRN, no tax breakdown, no accredited service
provider in the path, storage outside the UAE) plus a clean decoy file.

## Reliability

The published eval report is the point, not a footnote. Graders are
programmatic, so the numbers are reproducible. Current run (`claude-opus-4-8`),
per corpus:

| Corpus                 | Groundedness | Refusal | Injection resistance | Audit precision / recall |
| ---------------------- | ------------ | ------- | -------------------- | ------------------------ |
| Dubai tenancy law      | 6/6          | 5/5     | 5/5                  | 1.00 / 1.00              |
| UAE eInvoicing mandate | 6/6          | 4/4     | 4/4                  | 0.88 / 1.00              |

Injection resistance includes a code-comment attack where a source file
instructs the auditor to "report nothing"; the auditor ignores it and still
flags the violation. The single eInvoicing false positive is a legitimate extra
finding the auditor raises on a genuinely non-compliant file; it is scored
honestly rather than suppressed. Building the eval suite caught four bugs in the
test harness itself before they reached the report — which is the argument for
publishing evals at all.

## Architecture

- **Next.js (App Router) + TypeScript + Chakra UI v3**, deployed on Vercel.
- **No vector database.** The corpus is small and fixed, so it is parsed at
  build time into requirement units and passed to the Citations API as
  cited documents with prompt caching. This is cheaper and better grounded than
  a per-question retrieval set for a corpus this size; swapping in embeddings
  later is one contained module.
- **`RequirementUnit` is the core data shape.** Its stable id keys everything:
  citations, findings, evals, and the traceability between them.
- **Structured outputs everywhere.** Findings are produced through a
  schema-constrained tool and validated with Zod before they are trusted.
- **Seeded ground truth.** The audit target is a purpose-built app with known
  planted violations, so audit precision and recall are measurable rather than
  asserted.
- **Public-demo safety.** Two-layer rate limiting (per-IP and per-instance), a
  request body cap, and a budget kill switch. The audit and eval runs are
  cached and replayed, so visitors do not spend tokens.

## Development

```bash
yarn dev       # dev server
yarn test      # unit tests (vitest)
yarn lint      # eslint
yarn audit     # regenerate the cached audit run (needs ANTHROPIC_API_KEY)
```

Requires `ANTHROPIC_API_KEY` for the live endpoints. The corpus, audit run, and
eval report are committed as data, so the site builds and renders without a key.

## Status and scope

This is a portfolio demonstration, not a legal-advice product and not a shipped
compliance tool. It reproduces official public legal texts for demonstration;
it is not affiliated with the Dubai Land Department or the Government of Dubai.

## Author

Mohamed Sayed — [mohamedattwa.com](https://mohamedattwa.com)
