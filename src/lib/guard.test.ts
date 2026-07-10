import { describe, expect, it } from 'vitest';
import {
  GLOBAL_RATE_LIMIT_MAX,
  MAX_BODY_BYTES,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  checkRateWindow,
  isDemoDisabled,
} from '@/lib/guard';

describe('checkRateWindow', () => {
  const now = 1_000_000;

  it('allows a first request and records its timestamp', () => {
    expect(checkRateWindow([], now, 5, RATE_LIMIT_WINDOW_MS)).toEqual([now]);
  });

  it('allows requests under the limit and appends the new timestamp', () => {
    const stamps = [now - 1000, now - 2000];
    expect(checkRateWindow(stamps, now, 5, RATE_LIMIT_WINDOW_MS)).toEqual([
      now - 1000,
      now - 2000,
      now,
    ]);
  });

  it('blocks when the window is full', () => {
    const stamps = [now - 100, now - 200, now - 300];
    expect(checkRateWindow(stamps, now, 3, RATE_LIMIT_WINDOW_MS)).toBeNull();
  });

  it('expires timestamps older than the window', () => {
    const windowMs = 1000;
    const stamps = [now - 1001, now - 999];
    expect(checkRateWindow(stamps, now, 2, windowMs)).toEqual([now - 999, now]);
  });

  it('treats a timestamp exactly windowMs old as expired', () => {
    const windowMs = 1000;
    const stamps = [now - 1000];
    expect(checkRateWindow(stamps, now, 1, windowMs)).toEqual([now]);
  });

  it('never mutates the input list', () => {
    const stamps = [now - 100];
    const frozen = Object.freeze([...stamps]) as readonly number[];
    checkRateWindow(frozen, now, 5, RATE_LIMIT_WINDOW_MS);
    expect(frozen).toEqual(stamps);
  });
});

describe('isDemoDisabled', () => {
  it.each(['true', '1'])('is disabled when DEMO_DISABLED=%s', value => {
    expect(isDemoDisabled({ DEMO_DISABLED: value })).toBe(true);
  });

  it.each(['false', '0', ''])('is enabled when DEMO_DISABLED=%s', value => {
    expect(isDemoDisabled({ DEMO_DISABLED: value })).toBe(false);
  });

  it('is enabled when DEMO_DISABLED is unset', () => {
    expect(isDemoDisabled({})).toBe(false);
  });
});

describe('limits', () => {
  it('keeps the public-demo limits conservative', () => {
    expect(RATE_LIMIT_MAX).toBeLessThanOrEqual(20);
    expect(GLOBAL_RATE_LIMIT_MAX).toBeLessThanOrEqual(100);
    expect(MAX_BODY_BYTES).toBeLessThanOrEqual(10_000);
  });
});
