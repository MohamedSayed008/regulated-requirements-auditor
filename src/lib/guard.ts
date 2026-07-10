/**
 * Public-demo API guards: rate limiting, body caps, and the kill switch.
 *
 * The demo replays cached runs by default; these limits only gate the
 * endpoints that spend tokens. Ported from the portfolio's contact API
 * hardening (two-layer limit: per-IP plus per-instance global).
 */

// Per-IP: questions are cheap but grounded answers are not.
export const RATE_LIMIT_MAX = 10;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Per serverless instance, regardless of who is asking. Even if an attacker
// rotates IPs, one instance never spends more than this per hour.
export const GLOBAL_RATE_LIMIT_MAX = 60;
export const GLOBAL_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Questions and audit-run requests are short; anything bigger is abuse.
export const MAX_BODY_BYTES = 4_000;

/**
 * Rolling-window rate limit check. Returns the new timestamp list when
 * allowed, or null when the caller is over the limit. Never mutates the
 * input list.
 */
export function checkRateWindow(
  timestamps: readonly number[],
  now: number,
  max: number,
  windowMs: number
): number[] | null {
  const recent = timestamps.filter(t => now - t < windowMs);
  if (recent.length >= max) return null;
  return [...recent, now];
}

/**
 * Budget kill switch. When the monthly spend cap is hit, setting
 * DEMO_DISABLED=true (or 1) in the deployment env turns off every
 * token-spending endpoint without a redeploy; cached replays keep working.
 */
export function isDemoDisabled(env: Record<string, string | undefined> = process.env): boolean {
  const value = env.DEMO_DISABLED;
  return value === 'true' || value === '1';
}
