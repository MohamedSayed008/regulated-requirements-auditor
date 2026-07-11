import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { type RequirementUnit } from '@/lib/corpus';
import { type Corpus, DEFAULT_CORPUS_ID, getCorpus } from '@/lib/corpora';

/**
 * Grounded Q&A over a corpus via the Citations API.
 *
 * Design: the whole corpus is passed as citation-enabled documents on every
 * request, with one cache breakpoint on the last document. This deliberately
 * replaces the planned BM25 prefilter: a prefilter varies the document list
 * per question, which invalidates the prompt cache and can miss relevant
 * units; a corpus is small enough that caching makes it both cheaper after the
 * first request and better grounded.
 */

export const ASK_MODEL = process.env.ASK_MODEL ?? 'claude-opus-4-8';
export const MAX_ANSWER_TOKENS = 1024;

export const askRequestSchema = z.object({
  question: z.string().trim().min(8).max(500),
  corpusId: z.string().optional(),
});

export type AskRequest = z.infer<typeof askRequestSchema>;

/** Maps a citation's document_index back to the requirement unit id. */
export function unitIdAt(corpus: Corpus, index: number): string | null {
  return corpus.units[index]?.id ?? null;
}

export interface CorpusDocumentBlock {
  type: 'document';
  source: { type: 'text'; media_type: 'text/plain'; data: string };
  title: string;
  citations: { enabled: true };
  cache_control?: { type: 'ephemeral' };
}

function unitDocData(unit: RequirementUnit): string {
  const amended = unit.amendedBy ? ` (as amended by ${unit.amendedBy})` : '';
  const note = unit.editorialNote ? `\n[Editorial note: ${unit.editorialNote}]` : '';
  return `${unit.articleRef}${amended}\n${unit.textEn}${note}`;
}

export function buildCorpusDocuments(corpus: Corpus): CorpusDocumentBlock[] {
  return corpus.units.map((unit, index) => {
    const doc: CorpusDocumentBlock = {
      type: 'document',
      source: { type: 'text', media_type: 'text/plain', data: unitDocData(unit) },
      title: unit.id,
      citations: { enabled: true },
    };
    if (index === corpus.units.length - 1) {
      doc.cache_control = { type: 'ephemeral' };
    }
    return doc;
  });
}

export function systemPromptFor(corpus: Corpus): string {
  return `You are Mizan, a requirements assistant. You answer questions using ONLY the provided documents, which are requirement units from ${corpus.scopeForPrompt}.

Rules:
- Ground every factual claim in the documents and cite them. Never state a rule without a citation.
- If the documents do not cover the question, say plainly that this corpus does not cover it, and do not answer from general knowledge. If a related requirement exists, point to it.
- Answer in the language of the question: English questions get English answers, Arabic questions get Arabic answers.
- Be concise: give the direct answer first in one or two sentences, then only the detail that is needed.
- This is a public demo, not legal advice.${
    corpus.bilingual
      ? ' The Arabic text of the law is the authentic version and prevails over the English translation; mention this only when the distinction matters to the answer.'
      : ''
  }
- Never use em dashes. Use commas, colons, or periods.`;
}

export interface AnswerResult {
  text: string;
  citedUnitIds: string[];
  inputTokens: number;
  outputTokens: number;
}

/** Non-streaming ask, used by the eval harness. */
export async function answerQuestion(
  question: string,
  corpusId: string = DEFAULT_CORPUS_ID,
  client: Anthropic = new Anthropic()
): Promise<AnswerResult> {
  const corpus = getCorpus(corpusId);
  const response = await client.messages.create({
    model: ASK_MODEL,
    max_tokens: MAX_ANSWER_TOKENS,
    system: systemPromptFor(corpus),
    messages: [
      {
        role: 'user',
        content: [...buildCorpusDocuments(corpus), { type: 'text', text: question }],
      },
    ],
  });

  let text = '';
  const citedUnitIds = new Set<string>();
  for (const block of response.content) {
    if (block.type !== 'text') continue;
    text += block.text;
    for (const citation of block.citations ?? []) {
      const index = 'document_index' in citation ? citation.document_index : -1;
      const unitId = unitIdAt(corpus, index);
      if (unitId) citedUnitIds.add(unitId);
    }
  }

  return {
    text,
    citedUnitIds: [...citedUnitIds],
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}
