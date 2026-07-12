import { type RequirementUnit } from '@/lib/corpus';
import { CORPUS_LIST, getCorpus } from '@/lib/corpora';

/**
 * Keyword search over requirement units. Deliberately simple and transparent:
 * the corpora are small and fixed, so scored keyword matching over id, article
 * ref, text, and tags is predictable and auditable in a way embeddings are
 * not. Swappable for retrieval later behind the same signature.
 */

export interface RequirementMatch {
  unit: RequirementUnit;
  score: number;
}

function terms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(t => t.length >= 2);
}

export function searchRequirements(
  query: string,
  corpusId?: string,
  limit = 8
): RequirementMatch[] {
  const queryTerms = terms(query);
  if (queryTerms.length === 0) return [];

  const units = corpusId ? getCorpus(corpusId).units : CORPUS_LIST.flatMap(c => c.units);
  const matches: RequirementMatch[] = [];

  for (const unit of units) {
    const idText = unit.id.toLowerCase();
    const articleText = unit.articleRef.toLowerCase();
    const bodyText = `${unit.textEn} ${unit.textAr ?? ''}`.toLowerCase();
    const tagText = unit.tags.join(' ').toLowerCase();

    let score = 0;
    for (const term of queryTerms) {
      if (idText.includes(term)) score += 4;
      if (tagText.includes(term)) score += 3;
      if (articleText.includes(term)) score += 2;
      if (bodyText.includes(term)) score += 1;
    }
    if (score > 0) matches.push({ unit, score });
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, limit);
}
