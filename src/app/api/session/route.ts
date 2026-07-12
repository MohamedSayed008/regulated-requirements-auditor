import { NextRequest } from 'next/server';
import { z } from 'zod';
import { SESSION_COOKIE, SESSION_TTL_MS, passwordMatches, sameOrigin } from '@/lib/session';
import { issueSession, resolveClaims, revokeSessionToken, rotateIfDue } from '@/lib/auth';
import { checkAskRateLimit } from '@/lib/rate-limit';
import { MAX_BODY_BYTES } from '@/lib/guard';

const bodySchema = z.object({ password: z.string().min(1).max(200) });

function json(body: unknown, status: number, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

function cookie(value: string, maxAgeSeconds: number): string {
  // __Host- prefix requires Secure, Path=/, and no Domain attribute.
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

/**
 * Who am I + sliding rotation. The nav session chip calls this on load, which
 * is where an active session past the rotation window is revoked and reissued.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const claims = await resolveClaims(req.cookies.get(SESSION_COOKIE)?.value);
  if (!claims) return json({ role: 'viewer' }, 200);
  const rotated = await rotateIfDue(claims).catch(() => null);
  return json(
    { role: 'reviewer' },
    200,
    rotated ? { 'set-cookie': cookie(rotated, Math.floor(SESSION_TTL_MS / 1000)) } : undefined
  );
}

/** Sign in as the reviewer. Rate-limited to blunt brute force. */
export async function POST(req: NextRequest): Promise<Response> {
  if (!process.env.SESSION_SECRET || !process.env.REVIEWER_PASSWORD) {
    return json({ error: 'not_configured' }, 503);
  }
  if (!sameOrigin(req)) return json({ error: 'forbidden' }, 403);

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rate = await checkAskRateLimit(`session:${ip}`);
  if (!rate.ok) return json({ error: 'rate_limited' }, 429);

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: 'too_large' }, 413);
  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(raw);
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const parsed = bodySchema.safeParse(parsedBody);
  if (!parsed.success) return json({ error: 'invalid_request' }, 400);

  if (!passwordMatches(parsed.data.password, process.env.REVIEWER_PASSWORD)) {
    return json({ error: 'invalid_credentials' }, 401);
  }

  const token = await issueSession();
  return json({ role: 'reviewer' }, 200, {
    'set-cookie': cookie(token, Math.floor(SESSION_TTL_MS / 1000)),
  });
}

/** Sign out: revokes the session server-side, then clears the cookie. */
export async function DELETE(req: NextRequest): Promise<Response> {
  if (!sameOrigin(req)) return json({ error: 'forbidden' }, 403);
  await revokeSessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  return json({ role: 'viewer' }, 200, { 'set-cookie': cookie('', 0) });
}
