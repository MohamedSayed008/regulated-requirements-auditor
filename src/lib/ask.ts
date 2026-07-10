import { z } from 'zod';
import { parseCorpus, type RequirementUnit } from '@/lib/corpus';
import law26Json from '@/data/corpus/law-26-2007.json';
import decree43Json from '@/data/corpus/decree-43-2013.json';

/**
 * Grounded Q&A over the corpus via the Citations API.
 *
 * Design: the whole corpus (49 units) is passed as citation-enabled documents
 * on every request, with one cache breakpoint on the last document. This
 * deliberately replaces the planned BM25 prefilter: a prefilter varies the
 * document list per question, which invalidates the prompt cache and can miss
 * relevant units; the full corpus is small enough that caching makes it both
 * cheaper after the first request and better grounded.
 */

export const ASK_MODEL = process.env.ASK_MODEL ?? 'claude-opus-4-8';
export const MAX_ANSWER_TOKENS = 1024;

export const askRequestSchema = z.object({
  question: z.string().trim().min(8).max(500),
});

export type AskRequest = z.infer<typeof askRequestSchema>;

export const CORPUS_UNITS: readonly RequirementUnit[] = [
  ...parseCorpus(law26Json),
  ...parseCorpus(decree43Json),
];

/** Maps a citation's document_index back to the requirement unit id. */
export function unitIdAt(index: number): string | null {
  return CORPUS_UNITS[index]?.id ?? null;
}

export interface CorpusDocumentBlock {
  type: 'document';
  source: { type: 'text'; media_type: 'text/plain'; data: string };
  title: string;
  citations: { enabled: true };
  cache_control?: { type: 'ephemeral' };
}

export function buildCorpusDocuments(): CorpusDocumentBlock[] {
  return CORPUS_UNITS.map((unit, index) => {
    const amended = unit.amendedBy ? ' (as amended by Law No. 33 of 2008)' : '';
    const note = unit.editorialNote ? `\n[Editorial note: ${unit.editorialNote}]` : '';
    const doc: CorpusDocumentBlock = {
      type: 'document',
      source: {
        type: 'text',
        media_type: 'text/plain',
        data: `${unit.articleRef}${amended}\n${unit.textEn}${note}`,
      },
      title: unit.id,
      citations: { enabled: true },
    };
    if (index === CORPUS_UNITS.length - 1) {
      doc.cache_control = { type: 'ephemeral' };
    }
    return doc;
  });
}

export const SYSTEM_PROMPT = `You are Mizan, a requirements assistant for Dubai tenancy law. You answer questions using ONLY the provided documents: requirement units from Law No. (26) of 2007 regulating the relationship between landlords and tenants in Dubai (as amended by Law No. (33) of 2008) and Decree No. (43) of 2013 on rent increases.

Rules:
- Ground every factual claim in the documents and cite them. Never state a legal rule without a citation.
- If the documents do not cover the question, say plainly that this corpus does not cover it, and do not answer from general knowledge. If a related requirement exists, point to it.
- Answer in the language of the question: English questions get English answers, Arabic questions get Arabic answers.
- Be concise: give the direct answer first in one or two sentences, then only the detail that is needed.
- This is a public demo, not legal advice. The Arabic text of the law is the authentic version and prevails over the English translation; mention this only when the distinction matters to the answer.
- Never use em dashes. Use commas, colons, or periods.`;
