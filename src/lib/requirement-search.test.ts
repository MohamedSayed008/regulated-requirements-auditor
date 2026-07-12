import { describe, expect, it } from 'vitest';
import { searchRequirements } from '@/lib/requirement-search';

describe('searchRequirements', () => {
  it('finds the eviction notice clause from natural words', () => {
    const matches = searchRequirements('eviction notice twelve months', 'dubai-tenancy');
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.map(m => m.unit.id)).toContain('LAW26-2007/ART-25/2');
  });

  it('scopes to the requested corpus', () => {
    const matches = searchRequirements('invoice', 'dubai-tenancy');
    for (const match of matches) {
      expect(match.unit.id.startsWith('MOF') || match.unit.id.startsWith('MD243')).toBe(false);
    }
  });

  it('searches across all corpora when unscoped', () => {
    const matches = searchRequirements('accredited service provider');
    expect(matches.some(m => /^(MOF|MD243)/.test(m.unit.id))).toBe(true);
  });

  it('matches by unit id fragments', () => {
    const matches = searchRequirements('ART-14');
    expect(matches[0]?.unit.id).toContain('ART-14');
  });

  it('returns nothing for junk queries and respects the limit', () => {
    expect(searchRequirements('zzzzqqqq')).toEqual([]);
    expect(searchRequirements('the property rent landlord', undefined, 3)).toHaveLength(3);
  });
});
