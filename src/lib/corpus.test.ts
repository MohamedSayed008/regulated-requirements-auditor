import { describe, expect, it } from 'vitest';
import { REQUIREMENT_SOURCES, corpusDocumentSchema, parseCorpus } from '@/lib/corpus';
import documents from '@/data/corpus/documents.json';
import law26 from '@/data/corpus/law-26-2007.json';
import decree43 from '@/data/corpus/decree-43-2013.json';

const allUnits = [...law26, ...decree43];

describe('corpus documents metadata', () => {
  it('describes every source with valid metadata', () => {
    const parsed = documents.map(d => corpusDocumentSchema.parse(d));
    expect(parsed.map(d => d.slug).sort()).toEqual([...REQUIREMENT_SOURCES].sort());
  });
});

describe('corpus requirement units', () => {
  it('validates every unit against the schema', () => {
    expect(() => parseCorpus(allUnits)).not.toThrow();
  });

  it('has a sensible corpus size', () => {
    expect(allUnits.length).toBeGreaterThanOrEqual(40);
    expect(allUnits.length).toBeLessThanOrEqual(150);
  });

  it('has globally unique ids', () => {
    const ids = allUnits.map(u => (u as { id: string }).id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps each unit id prefixed by its source', () => {
    for (const unit of parseCorpus(allUnits)) {
      expect(unit.id.startsWith(`${unit.source}/`)).toBe(true);
    }
  });

  it('has bilingual text on every unit (Arabic authentic, English translation)', () => {
    for (const unit of parseCorpus(allUnits)) {
      expect(unit.textEn.trim().length).toBeGreaterThan(10);
      expect(unit.textAr.trim().length).toBeGreaterThan(10);
      expect(/[؀-ۿ]/.test(unit.textAr)).toBe(true);
    }
  });

  it('marks a meaningful subset as testable for the code audit', () => {
    const testable = parseCorpus(allUnits).filter(u => u.testable);
    expect(testable.length).toBeGreaterThanOrEqual(10);
  });

  it('contains the load-bearing tenancy rules', () => {
    const ids = allUnits.map(u => (u as { id: string }).id);
    // 90-day notice for rent changes (Art. 14 as amended) and the eviction
    // notice rules (Art. 25 as amended) are the demo's flagship examples.
    expect(ids.some(id => id.startsWith('LAW26-2007/ART-14'))).toBe(true);
    expect(ids.some(id => id.startsWith('LAW26-2007/ART-25'))).toBe(true);
    // Decree 43/2013 rent-increase slabs.
    expect(ids.some(id => id.startsWith('DEC43-2013/ART-1'))).toBe(true);
  });
});
