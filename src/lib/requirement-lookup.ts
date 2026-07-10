import { parseCorpus, type RequirementUnit } from '@/lib/corpus';
import law26 from '@/data/corpus/law-26-2007.json';
import decree43 from '@/data/corpus/decree-43-2013.json';

const byId = new Map<string, RequirementUnit>(
  [...parseCorpus(law26), ...parseCorpus(decree43)].map(u => [u.id, u])
);

export function requirementById(id: string): RequirementUnit | undefined {
  return byId.get(id);
}
