import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { MAX_BODY_BYTES, isDemoDisabled } from '@/lib/guard';
import { checkAskRateLimit } from '@/lib/rate-limit';
import { fetchRepoFiles } from '@/lib/repo-fetch';
import { runAudit } from '@/lib/audit-engine';

export const maxDuration = 120;

const bodySchema = z.object({
  repoUrl: z.string().trim().min(1).max(300),
  corpusId: z.string().optional(),
});

const FETCH_ERROR_STATUS: Record<string, number> = {
  invalid_url: 400,
  not_found: 404,
  empty: 422,
  too_large: 413,
  rate_limited: 429,
  fetch_failed: 502,
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  if (isDemoDisabled()) return json({ error: 'demo_disabled' }, 503);
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'not_configured' }, 503);

  if (!(req.headers.get('content-type') ?? '').includes('application/json')) {
    return json({ error: 'unsupported_media_type' }, 415);
  }
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

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rate = await checkAskRateLimit(ip);
  if (!rate.ok) return json({ error: 'rate_limited' }, 429);

  const fetched = await fetchRepoFiles(parsed.data.repoUrl);
  if (!fetched.ok) {
    return json({ error: fetched.error }, FETCH_ERROR_STATUS[fetched.error] ?? 500);
  }

  try {
    const target = `${fetched.owner}/${fetched.repo}`;
    const run = await runAudit(new Anthropic(), fetched.files, target, parsed.data.corpusId);
    return json({ run, branch: fetched.branch }, 200);
  } catch (error: unknown) {
    if (error instanceof Anthropic.RateLimitError)
      return json({ error: 'upstream_rate_limited' }, 429);
    console.error('audit-repo: error', error);
    return json({ error: 'audit_failed' }, 502);
  }
}
