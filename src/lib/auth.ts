import {
  type Role,
  type SessionClaims,
  SESSION_TTL_MS,
  newSessionId,
  parseSession,
  shouldRotate,
  signSession,
} from '@/lib/session';
import { getStore } from '@/lib/store';

/**
 * Role resolution that enforces the server-side registry: a token is only a
 * reviewer session if its signature, expiry, AND registered jti all hold.
 * Registry lookups failing closed (viewer) is deliberate.
 */

export async function resolveClaims(token: string | undefined): Promise<SessionClaims | null> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  const claims = parseSession(token, secret, Date.now());
  if (!claims) return null;
  try {
    return (await getStore().sessionActive(claims.jti)) ? claims : null;
  } catch {
    return null;
  }
}

export async function resolveRole(token: string | undefined): Promise<Role> {
  return (await resolveClaims(token)) ? 'reviewer' : 'viewer';
}

/** Mints, registers, and signs a fresh reviewer session token. */
export async function issueSession(): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not configured');
  const now = Date.now();
  const jti = newSessionId();
  await getStore().createSession(jti, SESSION_TTL_MS);
  return signSession({ jti, issuedAt: now, expiresAt: now + SESSION_TTL_MS }, secret);
}

/**
 * Sliding rotation: for an active session past the rotation window, revoke the
 * old jti and issue a fresh token. Returns the new token, or null when the
 * current one should keep being used.
 */
export async function rotateIfDue(claims: SessionClaims): Promise<string | null> {
  if (!shouldRotate(claims, Date.now())) return null;
  const token = await issueSession();
  await getStore()
    .revokeSession(claims.jti)
    .catch(() => {});
  return token;
}

export async function revokeSessionToken(token: string | undefined): Promise<void> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return;
  const claims = parseSession(token, secret, Date.now());
  if (!claims) return;
  await getStore()
    .revokeSession(claims.jti)
    .catch(() => {});
}
