import { NextRequest } from 'next/server';
import { z } from 'zod';
import { READINESS_MAX_BODY_BYTES } from '@/lib/guard';
import { checkReadinessRateLimit } from '@/lib/rate-limit';
import { processAnswersSchema, runReadiness } from '@/lib/readiness';
import { logEvent } from '@/lib/store';

/**
 * eInvoicing readiness check. Deterministic (no model calls, no token spend),
 * so it stays available even when the demo kill switch pauses the AI
 * endpoints. Runs server-side so every check lands in the governed audit log
 * like the rest of the pipeline.
 */

const bodySchema = z.object({
  invoice: z.unknown(),
  process: processAnswersSchema.optional(),
});

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  if (!(req.headers.get('content-type') ?? '').includes('application/json')) {
    return json({ error: 'unsupported_media_type' }, 415);
  }
  const raw = await req.text();
  if (raw.length > READINESS_MAX_BODY_BYTES) return json({ error: 'too_large' }, 413);

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(raw);
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const parsed = bodySchema.safeParse(parsedBody);
  if (!parsed.success) return json({ error: 'invalid_request' }, 400);

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rate = await checkReadinessRateLimit(ip);
  if (!rate.ok) return json({ error: 'rate_limited' }, 429);

  const report = runReadiness(parsed.data.invoice, parsed.data.process ?? {});
  logEvent({
    ts: new Date().toISOString(),
    actor: 'public',
    action: 'readiness',
    corpusId: 'uae-einvoicing',
    detail: `readiness: ${report.summary.pass} pass, ${report.summary.fail} fail, ${report.summary.notAssessed} not assessed (${report.summary.readyPercent}% ready)`,
  });
  return json({ report }, 200);
}
