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

export const requirementUnitSchema = z.object({
  id: z.string().regex(/^(LAW26-2007|DEC43-2013)\/ART-\d+[a-z]?(\/\d+)?$/),
  source: z.enum(REQUIREMENT_SOURCES),
  articleRef: z.string().min(1),
  textEn: z.string().min(1),
  textAr: z.string().min(1),
  tags: z.array(z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)),
  testable: z.boolean(),
  amendedBy: z.literal('LAW33-2008').optional(),
});

export type RequirementUnit = z.infer<typeof requirementUnitSchema>;

export const corpusDocumentSchema = z.object({
  slug: z.enum(REQUIREMENT_SOURCES),
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  officialSourceEn: z.string().url(),
  officialSourceAr: z.string().url(),
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

export function parseCorpus(units: unknown[]): RequirementUnit[] {
  return units.map(unit => requirementUnitSchema.parse(unit));
}
