import { describe, expect, it } from 'vitest';
import {
  type AuditLogEntry,
  MemoryStore,
  auditLogEntrySchema,
  fromMicros,
  reviewDecisionSchema,
  toMicros,
} from '@/lib/store';

function entry(overrides: Partial<AuditLogEntry> = {}): AuditLogEntry {
  return {
    ts: '2026-07-12T12:00:00.000Z',
    actor: 'public',
    action: 'ask',
    detail: 'test question',
    ...overrides,
  };
}

describe('micro-dollar conversion', () => {
  it('round-trips without float drift', () => {
    expect(toMicros(0.1088)).toBe(108_800);
    expect(fromMicros(108_800)).toBeCloseTo(0.1088, 10);
    expect(toMicros(0)).toBe(0);
  });
});

describe('schemas', () => {
  it('accepts a valid decision and rejects a bad status', () => {
    const valid = reviewDecisionSchema.safeParse({
      findingId: 'F1',
      runTarget: 'sample-app',
      status: 'approved',
      reviewer: 'reviewer',
      decidedAt: '2026-07-12T12:00:00.000Z',
    });
    expect(valid.success).toBe(true);
    const invalid = reviewDecisionSchema.safeParse({
      findingId: 'F1',
      runTarget: 'sample-app',
      status: 'maybe',
      reviewer: 'reviewer',
      decidedAt: '2026-07-12T12:00:00.000Z',
    });
    expect(invalid.success).toBe(false);
  });

  it('rejects oversized log detail', () => {
    const invalid = auditLogEntrySchema.safeParse(entry({ detail: 'x'.repeat(201) }));
    expect(invalid.success).toBe(false);
  });
});

describe('MemoryStore', () => {
  it('upserts decisions by findingId and lists them oldest first', async () => {
    const store = new MemoryStore();
    await store.saveDecision({
      findingId: 'F1',
      runTarget: 'sample-app',
      status: 'approved',
      reviewer: 'reviewer',
      decidedAt: '2026-07-12T12:00:00.000Z',
    });
    await store.saveDecision({
      findingId: 'F2',
      runTarget: 'sample-app',
      status: 'rejected',
      note: 'duplicate',
      reviewer: 'reviewer',
      decidedAt: '2026-07-12T11:00:00.000Z',
    });
    await store.saveDecision({
      findingId: 'F1',
      runTarget: 'sample-app',
      status: 'rejected',
      reviewer: 'reviewer',
      decidedAt: '2026-07-12T13:00:00.000Z',
    });

    const decisions = await store.listDecisions('sample-app');
    expect(decisions.map(d => d.findingId)).toEqual(['F2', 'F1']);
    expect(decisions[1].status).toBe('rejected');
    expect(await store.listDecisions('other-target')).toEqual([]);
  });

  it('accumulates totals from log entries', async () => {
    const store = new MemoryStore();
    await store.appendLog(entry({ costMicros: 100, inputTokens: 10, outputTokens: 5 }));
    await store.appendLog(
      entry({ action: 'audit_repo', costMicros: 200, inputTokens: 20, outputTokens: 15 })
    );
    await store.appendLog(entry({ action: 'review_decide', actor: 'reviewer' }));

    const totals = await store.getTotals();
    expect(totals.askCount).toBe(1);
    expect(totals.auditRepoCount).toBe(1);
    expect(totals.decisionCount).toBe(1);
    expect(totals.costMicros).toBe(300);
    expect(totals.inputTokens).toBe(30);
    expect(totals.outputTokens).toBe(20);
  });

  it('lists the log newest first', async () => {
    const store = new MemoryStore();
    await store.appendLog(entry({ detail: 'first' }));
    await store.appendLog(entry({ detail: 'second' }));
    const log = await store.listLog(10);
    expect(log.map(e => e.detail)).toEqual(['second', 'first']);
    expect(await store.listLog(1)).toHaveLength(1);
  });
});
