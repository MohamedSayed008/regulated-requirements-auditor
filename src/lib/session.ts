import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Reviewer sessions, hardened:
 *
 * - The cookie holds `reviewer.<jti>.<issuedAt>.<expiresAt>.<hmac>`: an
 *   HMAC-SHA256 signed statement with a random session id (jti).
 * - The jti must also exist in the server-side session registry (Redis), so
 *   sign-out is true revocation and a stolen token can be killed centrally,
 *   not just deleted from one browser.
 * - Sessions are short-lived (24h) and rotate on activity (hourly): rotation
 *   revokes the old jti and issues a fresh token, which is the property a
 *   refresh-token scheme provides, sized for a single-role system.
 * - The `__Host-` cookie prefix pins the cookie to this exact host over HTTPS
 *   with Path=/ and no Domain attribute.
 *
 * There is deliberately no user database: the only privileged role is
 * `reviewer`, unlocked by REVIEWER_PASSWORD. Swappable for a real identity
 * provider later; callers only ever ask for a role.
 */

export const SESSION_COOKIE = '__Host-mizan_session';
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
export const SESSION_ROTATE_AFTER_MS = 60 * 60 * 1000;

export type Role = 'viewer' | 'reviewer';

export interface SessionClaims {
  role: 'reviewer';
  jti: string;
  issuedAt: number;
  expiresAt: number;
}

function hmac(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function newSessionId(): string {
  return randomBytes(16).toString('base64url');
}

export function signSession(claims: Omit<SessionClaims, 'role'>, secret: string): string {
  const payload = `reviewer.${claims.jti}.${claims.issuedAt}.${claims.expiresAt}`;
  return `${payload}.${hmac(payload, secret)}`;
}

/** Verifies signature and expiry only; the caller must also check the registry. */
export function parseSession(
  token: string | undefined,
  secret: string,
  now: number
): SessionClaims | null {
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 5 || parts[0] !== 'reviewer') return null;
  const [role, jti, issuedAtRaw, expiresAtRaw, given] = parts;
  const issuedAt = Number(issuedAtRaw);
  const expiresAt = Number(expiresAtRaw);
  if (!jti || !Number.isFinite(issuedAt) || !Number.isFinite(expiresAt)) return null;
  if (expiresAt < now || issuedAt > now) return null;
  const expected = hmac(`${role}.${jti}.${issuedAtRaw}.${expiresAtRaw}`, secret);
  if (expected.length !== given.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(given))) return null;
  } catch {
    return null;
  }
  return { role: 'reviewer', jti, issuedAt, expiresAt };
}

/** An active session older than the rotation window should be reissued. */
export function shouldRotate(claims: SessionClaims, now: number): boolean {
  return now - claims.issuedAt >= SESSION_ROTATE_AFTER_MS;
}

export function passwordMatches(given: string, expected: string | undefined): boolean {
  if (!expected || given.length === 0) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * CSRF defense-in-depth for mutating routes: when the browser sends an Origin
 * header it must match the request host. SameSite=Lax already keeps the cookie
 * off cross-site POSTs; this catches misconfigurations and older agents.
 */
export function sameOrigin(req: { headers: Headers }): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
