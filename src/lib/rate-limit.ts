import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import {
  GLOBAL_RATE_LIMIT_MAX,
  GLOBAL_RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  checkRateWindow,
} from '@/lib/guard';

/**
 * Durable rate limiting.
 *
 * In-memory counters do not work on serverless: each instance has its own map,
 * so a per-IP window never accumulates across instances (the red-team pass
 * confirmed this). When Upstash Redis credentials are present we use a shared
 * sliding-window limiter that actually holds across instances. Without them we
 * fall back to the in-memory limiter, which still bounds a burst to one warm
 * instance and is the right behaviour for local dev.
 *
 * Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable the durable
 * path in production.
 */

// Accept either the Upstash Marketplace names or the older Vercel KV names, so
// whichever the integration provisions works without a code change.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

const durableLimiter =
  redisUrl && redisToken
    ? new Ratelimit({
        redis: new Redis({ url: redisUrl, token: redisToken }),
        limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX, `${RATE_LIMIT_WINDOW_MS} ms`),
        prefix: 'mizan:ask',
        analytics: false,
      })
    : null;

// In-memory fallback state (per instance).
const ipHits = new Map<string, number[]>();
let globalHits: number[] = [];

export interface RateDecision {
  ok: boolean;
  durable: boolean;
}

export async function checkAskRateLimit(ip: string): Promise<RateDecision> {
  if (durableLimiter) {
    const { success } = await durableLimiter.limit(ip);
    return { ok: success, durable: true };
  }

  const now = Date.now();
  const ipWindow = checkRateWindow(ipHits.get(ip) ?? [], now, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (ipWindow === null) return { ok: false, durable: false };
  const globalWindow = checkRateWindow(
    globalHits,
    now,
    GLOBAL_RATE_LIMIT_MAX,
    GLOBAL_RATE_LIMIT_WINDOW_MS
  );
  if (globalWindow === null) return { ok: false, durable: false };
  ipHits.set(ip, ipWindow);
  globalHits = globalWindow;
  if (ipHits.size > 5000) ipHits.clear();
  return { ok: true, durable: false };
}
