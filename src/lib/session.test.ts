import { describe, expect, it } from 'vitest';
import { passwordMatches, signSession, verifySession } from '@/lib/session';

const SECRET = 'test-secret-value';

describe('signSession / verifySession', () => {
  it('round-trips a valid reviewer session', () => {
    const expiresAt = Date.now() + 60_000;
    const token = signSession(expiresAt, SECRET);
    expect(verifySession(token, SECRET, Date.now())).toBe('reviewer');
  });

  it('rejects an expired session', () => {
    const token = signSession(Date.now() - 1, SECRET);
    expect(verifySession(token, SECRET, Date.now())).toBe('viewer');
  });

  it('rejects a tampered payload', () => {
    const token = signSession(Date.now() + 60_000, SECRET);
    const [role, expires, sig] = token.split('.');
    const forged = `${role}.${Number(expires) + 999_999}.${sig}`;
    expect(verifySession(forged, SECRET, Date.now())).toBe('viewer');
  });

  it('rejects a token signed with a different secret', () => {
    const token = signSession(Date.now() + 60_000, 'other-secret');
    expect(verifySession(token, SECRET, Date.now())).toBe('viewer');
  });

  it('rejects malformed and missing tokens', () => {
    expect(verifySession(undefined, SECRET, Date.now())).toBe('viewer');
    expect(verifySession('', SECRET, Date.now())).toBe('viewer');
    expect(verifySession('reviewer.abc', SECRET, Date.now())).toBe('viewer');
    expect(verifySession('admin.123.sig', SECRET, Date.now())).toBe('viewer');
  });

  it('rejects everything when the secret is empty', () => {
    const token = signSession(Date.now() + 60_000, SECRET);
    expect(verifySession(token, '', Date.now())).toBe('viewer');
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
