import { Redis } from '@upstash/redis';
import { z } from 'zod';

/**
 * Durable storage for v4: review decisions, the audit log, and usage totals.
 *
 * Callers program against the Store interface; the backing implementation is
 * Upstash Redis when credentials are present (same env names the rate limiter
 * accepts) and an in-memory store otherwise, which is the right behaviour for
 * local dev and keeps the public demo working without any configuration. A
 * relational backend can replace RedisStore behind the same interface when
 * workspaces arrive.
 *
 * Costs are stored as integer micro-dollars so totals never accumulate float
 * error.
 */

export const reviewDecisionSchema = z.object({
  findingId: z.string().min(1).max(40),
  runTarget: z.string().min(1).max(120),
  status: z.enum(['approved', 'rejected']),
  note: z.string().max(500).optional(),
  reviewer: z.string().min(1).max(60),
  decidedAt: z.string(),
});
export type ReviewDecision = z.infer<typeof reviewDecisionSchema>;

export const LOG_ACTIONS = ['ask', 'audit_repo', 'review_decide', 'readiness'] as const;

export const auditLogEntrySchema = z.object({
  ts: z.string(),
  actor: z.enum(['public', 'reviewer']),
  action: z.enum(LOG_ACTIONS),
  corpusId: z.string().max(60).optional(),
  /** Short human-readable detail; may carry user input, so reviewer-only in UI. */
  detail: z.string().max(200),
  costMicros: z.number().int().nonnegative().optional(),
  inputTokens: z.number().int().nonnegative().optional(),
  outputTokens: z.number().int().nonnegative().optional(),
});
export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;

export interface UsageTotals {
  askCount: number;
  auditRepoCount: number;
  decisionCount: number;
  costMicros: number;
  inputTokens: number;
  outputTokens: number;
}

export interface Store {
  saveDecision(decision: ReviewDecision): Promise<void>;
  /** Reverts a finding to proposed by removing its persisted decision. */
  deleteDecision(runTarget: string, findingId: string): Promise<void>;
  /** Decisions for one audited target, newest last, keyed by findingId. */
  listDecisions(runTarget: string): Promise<ReviewDecision[]>;
  appendLog(entry: AuditLogEntry): Promise<void>;
  /** Newest first. */
  listLog(limit: number): Promise<AuditLogEntry[]>;
  getTotals(): Promise<UsageTotals>;
  /** Session registry: a token is only valid while its jti is registered. */
  createSession(jti: string, ttlMs: number): Promise<void>;
  sessionActive(jti: string): Promise<boolean>;
  revokeSession(jti: string): Promise<void>;
}

const KEYS = {
  decisions: (target: string) => `mizan:decisions:${target}`,
  log: 'mizan:log',
  totals: 'mizan:totals',
  session: (jti: string) => `mizan:session:${jti}`,
} as const;

const LOG_CAP = 300;

export function toMicros(usd: number): number {
  return Math.round(usd * 1_000_000);
}

export function fromMicros(micros: number): number {
  return micros / 1_000_000;
}

const EMPTY_TOTALS: UsageTotals = {
  askCount: 0,
  auditRepoCount: 0,
  decisionCount: 0,
  costMicros: 0,
  inputTokens: 0,
  outputTokens: 0,
};

function totalsIncrements(entry: AuditLogEntry): Partial<UsageTotals> {
  return {
    askCount: entry.action === 'ask' ? 1 : 0,
    auditRepoCount: entry.action === 'audit_repo' ? 1 : 0,
    decisionCount: entry.action === 'review_decide' ? 1 : 0,
    costMicros: entry.costMicros ?? 0,
    inputTokens: entry.inputTokens ?? 0,
    outputTokens: entry.outputTokens ?? 0,
  };
}

class RedisStore implements Store {
  constructor(private redis: Redis) {}

  async saveDecision(decision: ReviewDecision): Promise<void> {
    await this.redis.hset(KEYS.decisions(decision.runTarget), {
      [decision.findingId]: JSON.stringify(decision),
    });
  }

  async deleteDecision(runTarget: string, findingId: string): Promise<void> {
    await this.redis.hdel(KEYS.decisions(runTarget), findingId);
  }

  async listDecisions(runTarget: string): Promise<ReviewDecision[]> {
    const raw = await this.redis.hgetall<Record<string, unknown>>(KEYS.decisions(runTarget));
    if (!raw) return [];
    const decisions: ReviewDecision[] = [];
    for (const value of Object.values(raw)) {
      const parsed = reviewDecisionSchema.safeParse(
        typeof value === 'string' ? JSON.parse(value) : value
      );
      if (parsed.success) decisions.push(parsed.data);
    }
    return decisions.sort((a, b) => a.decidedAt.localeCompare(b.decidedAt));
  }

  async appendLog(entry: AuditLogEntry): Promise<void> {
    const inc = totalsIncrements(entry);
    await Promise.all([
      this.redis
        .lpush(KEYS.log, JSON.stringify(entry))
        .then(() => this.redis.ltrim(KEYS.log, 0, LOG_CAP - 1)),
      ...Object.entries(inc)
        .filter(([, delta]) => delta > 0)
        .map(([field, delta]) => this.redis.hincrby(KEYS.totals, field, delta)),
    ]);
  }

  async listLog(limit: number): Promise<AuditLogEntry[]> {
    const raw = await this.redis.lrange<unknown>(KEYS.log, 0, limit - 1);
    const entries: AuditLogEntry[] = [];
    for (const value of raw) {
      const parsed = auditLogEntrySchema.safeParse(
        typeof value === 'string' ? JSON.parse(value) : value
      );
      if (parsed.success) entries.push(parsed.data);
    }
    return entries;
  }

  async getTotals(): Promise<UsageTotals> {
    const raw = await this.redis.hgetall<Record<string, string | number>>(KEYS.totals);
    if (!raw) return { ...EMPTY_TOTALS };
    const num = (key: keyof UsageTotals) => {
      const value = raw[key];
      const parsed = typeof value === 'number' ? value : Number(value ?? 0);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    return {
      askCount: num('askCount'),
      auditRepoCount: num('auditRepoCount'),
      decisionCount: num('decisionCount'),
      costMicros: num('costMicros'),
      inputTokens: num('inputTokens'),
      outputTokens: num('outputTokens'),
    };
  }

  async createSession(jti: string, ttlMs: number): Promise<void> {
    await this.redis.set(KEYS.session(jti), '1', { px: ttlMs });
  }

  async sessionActive(jti: string): Promise<boolean> {
    return (await this.redis.exists(KEYS.session(jti))) === 1;
  }

  async revokeSession(jti: string): Promise<void> {
    await this.redis.del(KEYS.session(jti));
  }
}

/** Per-instance fallback for local dev without Redis credentials. */
export class MemoryStore implements Store {
  private decisions = new Map<string, Map<string, ReviewDecision>>();
  private log: AuditLogEntry[] = [];
  private totals: UsageTotals = { ...EMPTY_TOTALS };

  async saveDecision(decision: ReviewDecision): Promise<void> {
    const byTarget = this.decisions.get(decision.runTarget) ?? new Map<string, ReviewDecision>();
    byTarget.set(decision.findingId, decision);
    this.decisions.set(decision.runTarget, byTarget);
  }

  async deleteDecision(runTarget: string, findingId: string): Promise<void> {
    this.decisions.get(runTarget)?.delete(findingId);
  }

  async listDecisions(runTarget: string): Promise<ReviewDecision[]> {
    return [...(this.decisions.get(runTarget)?.values() ?? [])].sort((a, b) =>
      a.decidedAt.localeCompare(b.decidedAt)
    );
  }

  async appendLog(entry: AuditLogEntry): Promise<void> {
    this.log = [entry, ...this.log].slice(0, LOG_CAP);
    const inc = totalsIncrements(entry);
    this.totals = {
      askCount: this.totals.askCount + (inc.askCount ?? 0),
      auditRepoCount: this.totals.auditRepoCount + (inc.auditRepoCount ?? 0),
      decisionCount: this.totals.decisionCount + (inc.decisionCount ?? 0),
      costMicros: this.totals.costMicros + (inc.costMicros ?? 0),
      inputTokens: this.totals.inputTokens + (inc.inputTokens ?? 0),
      outputTokens: this.totals.outputTokens + (inc.outputTokens ?? 0),
    };
  }

  async listLog(limit: number): Promise<AuditLogEntry[]> {
    return this.log.slice(0, limit);
  }

  async getTotals(): Promise<UsageTotals> {
    return { ...this.totals };
  }

  private sessions = new Map<string, number>();

  async createSession(jti: string, ttlMs: number): Promise<void> {
    this.sessions.set(jti, Date.now() + ttlMs);
  }

  async sessionActive(jti: string): Promise<boolean> {
    const expiresAt = this.sessions.get(jti);
    if (expiresAt === undefined) return false;
    if (expiresAt < Date.now()) {
      this.sessions.delete(jti);
      return false;
    }
    return true;
  }

  async revokeSession(jti: string): Promise<void> {
    this.sessions.delete(jti);
  }
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

const store: Store =
  redisUrl && redisToken
    ? new RedisStore(new Redis({ url: redisUrl, token: redisToken }))
    : new MemoryStore();

export function getStore(): Store {
  return store;
}

/** Fire-and-forget log write: persistence problems must never fail a request. */
export function logEvent(entry: AuditLogEntry): void {
  void getStore()
    .appendLog(entry)
    .catch(() => {});
}
