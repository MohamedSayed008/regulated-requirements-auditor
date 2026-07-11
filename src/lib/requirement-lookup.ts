import { type RequirementUnit } from '@/lib/corpus';
import { allUnits } from '@/lib/corpora';

const byId = new Map<string, RequirementUnit>(allUnits().map(u => [u.id, u]));

export function requirementById(id: string): RequirementUnit | undefined {
  return byId.get(id);
}
