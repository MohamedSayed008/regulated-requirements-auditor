import { describe, expect, it } from 'vitest';
import {
  SESSION_ROTATE_AFTER_MS,
  newSessionId,
  parseSession,
  passwordMatches,
  sameOrigin,
  shouldRotate,
  signSession,
} from '@/lib/session';

const SECRET = 'test-secret-value';

function makeToken(overrides: Partial<{ jti: string; issuedAt: number; expiresAt: number }> = {}) {
  const now = Date.now();
  const claims = {
    jti: overrides.jti ?? newSessionId(),
    issuedAt: overrides.issuedAt ?? now,
    expiresAt: overrides.expiresAt ?? now + 60_000,
  };
  return { claims, token: signSession(claims, SECRET) };
}

describe('signSession / parseSession', () => {
  it('round-trips a valid reviewer session with its jti', () => {
    const { claims, token } = makeToken();
    const parsed = parseSession(token, SECRET, Date.now());
    expect(parsed?.role).toBe('reviewer');
    expect(parsed?.jti).toBe(claims.jti);
  });

  it('rejects an expired session', () => {
    const { token } = makeToken({ issuedAt: Date.now() - 120_000, expiresAt: Date.now() - 1 });
    expect(parseSession(token, SECRET, Date.now())).toBeNull();
  });

  it('rejects a token issued in the future', () => {
    const { token } = makeToken({ issuedAt: Date.now() + 60_000 });
    expect(parseSession(token, SECRET, Date.now())).toBeNull();
  });

  it('rejects a tampered expiry', () => {
    const { token } = makeToken();
    const parts = token.split('.');
    parts[3] = String(Number(parts[3]) + 999_999);
    expect(parseSession(parts.join('.'), SECRET, Date.now())).toBeNull();
  });

  it('rejects a swapped jti', () => {
    const { token } = makeToken();
    const parts = token.split('.');
    parts[1] = newSessionId();
    expect(parseSession(parts.join('.'), SECRET, Date.now())).toBeNull();
  });

  it('rejects a token signed with a different secret', () => {
    const now = Date.now();
    const token = signSession(
      { jti: newSessionId(), issuedAt: now, expiresAt: now + 60_000 },
      'other-secret'
    );
    expect(parseSession(token, SECRET, now)).toBeNull();
  });

  it('rejects malformed and missing tokens', () => {
    const now = Date.now();
    expect(parseSession(undefined, SECRET, now)).toBeNull();
    expect(parseSession('', SECRET, now)).toBeNull();
    expect(parseSession('reviewer.only.three', SECRET, now)).toBeNull();
    expect(parseSession('admin.j.1.2.sig', SECRET, now)).toBeNull();
  });

  it('rejects everything when the secret is empty', () => {
    const { token } = makeToken();
    expect(parseSession(token, '', Date.now())).toBeNull();
  });
});

describe('shouldRotate', () => {
  it('rotates only after the rotation window', () => {
    const now = Date.now();
    const fresh = { role: 'reviewer' as const, jti: 'a', issuedAt: now, expiresAt: now + 1 };
    const stale = {
      role: 'reviewer' as const,
      jti: 'a',
      issuedAt: now - SESSION_ROTATE_AFTER_MS - 1,
      expiresAt: now + 1,
    };
    expect(shouldRotate(fresh, now)).toBe(false);
    expect(shouldRotate(stale, now)).toBe(true);
  });
});

describe('passwordMatches', () => {
  it('accepts an exact match only', () => {
    expect(passwordMatches('hunter2', 'hunter2')).toBe(true);
    expect(passwordMatches('hunter2', 'hunter3')).toBe(false);
    expect(passwordMatches('hunter', 'hunter2')).toBe(false);
  });

  it('rejects when the expected password is unset or the given one empty', () => {
    expect(passwordMatches('anything', undefined)).toBe(false);
    expect(passwordMatches('', 'expected')).toBe(false);
  });
});

describe('sameOrigin', () => {
  function req(headers: Record<string, string>) {
    return { headers: new Headers(headers) };
  }

  it('allows requests without an Origin header', () => {
    expect(sameOrigin(req({ host: 'audit.example.com' }))).toBe(true);
  });

  it('allows a matching origin and rejects a foreign one', () => {
    expect(
      sameOrigin(req({ origin: 'https://audit.example.com', host: 'audit.example.com' }))
    ).toBe(true);
    expect(sameOrigin(req({ origin: 'https://evil.example.com', host: 'audit.example.com' }))).toBe(
      false
    );
  });

  it('prefers the forwarded host behind the proxy', () => {
    expect(
      sameOrigin(
        req({
          origin: 'https://audit.example.com',
          'x-forwarded-host': 'audit.example.com',
          host: 'internal:3000',
        })
      )
    ).toBe(true);
  });

  it('rejects an unparseable origin', () => {
    expect(sameOrigin(req({ origin: 'not a url', host: 'audit.example.com' }))).toBe(false);
  });
});
