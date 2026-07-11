import { describe, expect, it } from 'vitest';
import {
  ASK_MODEL,
  MAX_ANSWER_TOKENS,
  askRequestSchema,
  buildCorpusDocuments,
  systemPromptFor,
  unitIdAt,
} from '@/lib/ask';
import { getCorpus } from '@/lib/corpora';

const tenancy = getCorpus('dubai-tenancy');
const CORPUS_UNITS = tenancy.units;

describe('askRequestSchema', () => {
  it('accepts a normal question', () => {
    const result = askRequestSchema.safeParse({
      question: 'What notice period applies to rent increases?',
    });
    expect(result.success).toBe(true);
  });

  it('accepts an Arabic question', () => {
    const result = askRequestSchema.safeParse({ question: 'ما هي مدة الإخطار لزيادة الإيجار؟' });
    expect(result.success).toBe(true);
  });

  it('trims whitespace', () => {
    const result = askRequestSchema.parse({ question: '  hello there?  ' });
    expect(result.question).toBe('hello there?');
  });

  it('rejects empty, too-short, and too-long questions', () => {
    expect(askRequestSchema.safeParse({ question: '' }).success).toBe(false);
    expect(askRequestSchema.safeParse({ question: 'hi' }).success).toBe(false);
    expect(askRequestSchema.safeParse({ question: 'x'.repeat(501) }).success).toBe(false);
  });

  it('rejects missing or non-string question', () => {
    expect(askRequestSchema.safeParse({}).success).toBe(false);
    expect(askRequestSchema.safeParse({ question: 42 }).success).toBe(false);
  });
});

describe('buildCorpusDocuments', () => {
  const docs = buildCorpusDocuments(tenancy);

  it('produces one document per requirement unit', () => {
    expect(docs.length).toBe(CORPUS_UNITS.length);
    expect(docs.length).toBeGreaterThanOrEqual(40);
  });

  it('titles every document with its unit id so citations map back', () => {
    for (const [i, doc] of docs.entries()) {
      expect(doc.title).toBe(CORPUS_UNITS[i].id);
    }
  });

  it('enables citations on every document', () => {
    for (const doc of docs) {
      expect(doc.citations).toEqual({ enabled: true });
    }
  });

  it('places exactly one cache breakpoint, on the last document', () => {
    const withCache = docs.filter(d => d.cache_control !== undefined);
    expect(withCache.length).toBe(1);
    expect(docs[docs.length - 1].cache_control).toEqual({ type: 'ephemeral' });
  });

  it('embeds the English text and article reference in the document data', () => {
    const art14Index = CORPUS_UNITS.findIndex(u => u.id === 'LAW26-2007/ART-14');
    const source = docs[art14Index].source;
    expect(source.type).toBe('text');
    expect(source.data).toContain('Article');
    expect(source.data).toContain('ninety');
  });
});

describe('unitIdAt', () => {
  it('maps a citation document_index back to the unit id', () => {
    expect(unitIdAt(tenancy, 0)).toBe(CORPUS_UNITS[0].id);
  });

  it('returns null for out-of-range indexes', () => {
    expect(unitIdAt(tenancy, -1)).toBeNull();
    expect(unitIdAt(tenancy, CORPUS_UNITS.length)).toBeNull();
  });
});

describe('model configuration', () => {
  it('uses a real model id and a bounded answer budget', () => {
    expect(ASK_MODEL).toMatch(/^claude-/);
    expect(MAX_ANSWER_TOKENS).toBeLessThanOrEqual(2048);
  });

  it('system prompt enforces grounding, refusal, bilingual answers, and the style rules', () => {
    const prompt = systemPromptFor(tenancy);
    expect(prompt).toMatch(/cite/i);
    expect(prompt).toMatch(/not covered|does not cover/i);
    expect(prompt).toMatch(/arabic/i);
    expect(prompt).toMatch(/not legal advice/i);
    expect(prompt).not.toContain('—');
  });
});
