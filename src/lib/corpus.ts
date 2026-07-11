import { z } from 'zod';

/**
 * The corpus data contract. Everything in the app (citations, findings,
 * evals, the traceability matrix) keys off RequirementUnit.id, so this
 * shape and the ID format are the most stable API in the codebase.
 *
 * ID format: <SOURCE>/ART-<article>[/<clause>], e.g. "LAW26-2007/ART-9/2".
 * Amended articles keep their Law 26/2007 identity and carry `amendedBy`,
 * with the consolidated (post-amendment) text as textEn/textAr.
 */

export const REQUIREMENT_SOURCES = ['LAW26-2007', 'DEC43-2013'] as const;

export type RequirementSource = (typeof REQUIREMENT_SOURCES)[number];

// Generic id: <SOURCE>/<REF>[/<clause>], e.g. LAW26-2007/ART-9/2 or
// MD243-2025/REQ-4. Sources and refs are corpus-defined, not enumerated here.
export const requirementUnitSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9-]+\/[A-Za-z]+-\d+[a-z]?(\/\d+)?$/),
  source: z.string().min(1),
  corpusId: z.string().optional(),
  articleRef: z.string().min(1),
  textEn: z.string().min(1),
  // Arabic is present for corpora whose official text is bilingual (tenancy);
  // optional for EN-primary corpora (eInvoicing).
  textAr: z.string().min(1).optional(),
  tags: z.array(z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)),
  testable: z.boolean(),
  amendedBy: z.string().optional(),
  /**
   * Editorial annotation for verbatim-fidelity exceptions: source typos
   * reproduced as-is, layout reconstruction, or known EN/AR divergences in
   * the official texts. The text fields stay verbatim; this field explains.
   */
  editorialNote: z.string().optional(),
});

export type RequirementUnit = z.infer<typeof requirementUnitSchema>;

export const corpusDocumentSchema = z.object({
  slug: z.string().min(1),
  titleEn: z.string().min(1),
  titleAr: z.string().min(1).optional(),
  officialSourceEn: z.string().url(),
  officialSourceAr: z.string().url().optional(),
  amendedBy: z.string().optional(),
});

export type CorpusDocument = z.infer<typeof corpusDocumentSchema>;

/**
 * Shown wherever corpus text is rendered. The Arabic Official Gazette text
 * is the sole authentic version; the English text is the Government of
 * Dubai's translation. This is a legal posture requirement, not decoration.
 */
export const CORPUS_DISCLAIMER = {
  en: 'Unofficial reproduction for demonstration purposes, not legal advice. Source: Dubai Legislation Portal (Supreme Legislation Committee). In case of conflict, the Arabic text prevails.',
  ar: 'نسخة غير رسمية لأغراض العرض فقط وليست استشارة قانونية. المصدر: بوابة تشريعات دبي (اللجنة العليا للتشريعات). في حال التعارض، يسود النص العربي.',
} as const;

/**
 * Result of the July 2026 currency verification (independent web research
 * against the Dubai Legislation Portal, Lexis, and 2026 legal guides).
 * Re-verify and update this note when the corpus is next touched.
 */
export const CORPUS_CURRENCY = {
  verifiedAt: '2026-07-11',
  note: 'Currency verified July 2026: Law No. 26 of 2007 is in force as amended only by Law No. 33 of 2008; Decree No. 43 of 2013 is in force unamended. Since January 2025 the DLD Smart Rental Index supplies the market averages that the decree’s rent-increase slabs are measured against. Not included in this corpus: the March 2026 Supreme Legislation Committee interpretive clarification of Article 34 (guidance only, no text change) and Law No. 4 of 2026 on shared housing (expected in force around September 2026, shared accommodation only).',
} as const;

export function parseCorpus(units: unknown[]): RequirementUnit[] {
  return units.map(unit => requirementUnitSchema.parse(unit));
}
