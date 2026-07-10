# Mizan - Regulated Requirements Auditor

> ميزان - "the scale". Status: pre-alpha, in active development.

An AI workflow application for regulated, document-heavy processes: it reads
requirement and policy documents, answers questions with clause-level
citations, audits code against the requirements, raises structured findings,
and requires human approval before anything becomes final. Every release
ships with a published evaluation report.

Built as governed agentic AI: no citation, no answer; no human approval, no
finding; no eval report, no release.

## What it does (v1 scope)

- **Requirements browser**: a fixed public corpus (Dubai tenancy law:
  Law 26/2007, Law 33/2008, Decree 43/2013) parsed into stable, citable
  requirement units, in English and Arabic.
- **Ask with citations**: grounded Q&A over the corpus. Citations come from
  the model's citation API, not prompt engineering. Out-of-corpus questions
  get a refusal, and the refusal is eval-tested.
- **Code audit**: an agent audits a sample tenancy-management app (with
  intentionally seeded violations) against the testable requirements and
  raises findings with file/line references.
- **Review queue**: findings are proposed, never final. A reviewer sees the
  clause and the code side by side and approves or rejects with a note.
- **Trace and cost**: every run exposes its retrieval, model calls, schema
  validation, latency, and token cost.
- **Published evals**: citation groundedness, refusal correctness, audit
  precision/recall against seeded ground truth, and adversarial results,
  including prompt injection attempts via the audited code itself.

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS v4, Anthropic API with
Zod-validated structured outputs. No database and no vector store in v1:
the corpus is small, fixed, and indexed at build time.

## Development

```bash
yarn dev      # start the dev server
yarn test     # unit + integration tests
yarn evals    # run the eval suite
yarn lint     # eslint
```

## Author

Mohamed Sayed - [mohamedattwa.com](https://mohamedattwa.com)
