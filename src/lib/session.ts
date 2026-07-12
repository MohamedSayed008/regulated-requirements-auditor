import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Minimal role session: an HMAC-signed cookie carrying `role.expiresAt`. No
 * user database; the only privileged role is `reviewer`, unlocked by the
 * REVIEWER_PASSWORD environment variable. This is the smallest honest RBAC:
 * public visitors are viewers, the signed-in reviewer can persist decisions
 * and see log detail. Swappable for a real identity provider later without
 * changing callers, which only ever ask for a role.
 */

export const SESSION_COOKIE = 'mizan_session';
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type Role = 'viewer' | 'reviewer';

function hmac(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

/** `reviewer.<expiresEpochMs>.<signature>` */
export function signSession(expiresAt: number, secret: string): string {
  const payload = `reviewer.${expiresAt}`;
  return `${payload}.${hmac(payload, secret)}`;
}

export function verifySession(token: string | undefined, secret: string, now: number): Role {
  if (!token || !secret) return 'viewer';
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'reviewer') return 'viewer';
  const expiresAt = Number(parts[1]);
  if (!Number.isFinite(expiresAt) || expiresAt < now) return 'viewer';
  const expected = hmac(`${parts[0]}.${parts[1]}`, secret);
  const given = parts[2];
  if (expected.length !== given.length) return 'viewer';
  try {
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(given))) return 'viewer';
  } catch {
    return 'viewer';
  }
  return 'reviewer';
}

export function passwordMatches(given: string, expected: string | undefined): boolean {
  if (!expected || given.length === 0) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Resolves the role from a cookie header value, using env configuration. */
export function roleFromCookie(token: string | undefined): Role {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return 'viewer';
  return verifySession(token, secret, Date.now());
}
