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

| Capability                 | Where     | How it works                                                                                                                                                                                                                 |
| -------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ask with citations**     | `/ask`    | Grounded Q&A over the corpus via the Claude Citations API. Citations come from the model's citation output, not prompt engineering. Out-of-corpus questions are refused, and the refusal is eval-tested. English and Arabic. |
| **Audit code vs. the law** | `/audit`  | An agent audits a tenancy-management app against the testable requirements and emits Zod-validated findings, each tied to the clause it violates with file and line references.                                              |
| **Human approval**         | `/review` | Findings are proposed, never final. A reviewer sees the clause and the code side by side, approves or rejects with a note, and gets a decision trail.                                                                        |
| **Published evals**        | `/evals`  | Groundedness, refusal correctness, prompt-injection resistance, and audit precision/recall against a seeded ground truth. Graders are programmatic, so the numbers are reproducible.                                         |

## The corpus

Dubai tenancy law, parsed into 49 citable requirement units, English and Arabic:

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

## Reliability

The published eval report is the point, not a footnote. Current run
(`claude-opus-4-8`):

- **Groundedness 6/6** — answers cite the expected clause.
- **Refusal 5/5** — out-of-corpus questions are declined.
- **Injection resistance 5/5** — including a code-comment attack where a source
  file instructs the auditor to "report nothing"; the auditor ignores it and
  still flags the violation.
- **Audit precision 1.0, recall 1.0** — all five seeded violations detected,
  zero false positives on the clean decoy files.

Building the eval suite caught four bugs in the test harness itself before they
reached the report — which is the argument for publishing evals at all.

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
