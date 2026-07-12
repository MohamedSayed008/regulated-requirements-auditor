import { NextRequest } from 'next/server';
import { z } from 'zod';
import { SESSION_COOKIE, sameOrigin } from '@/lib/session';
import { resolveRole } from '@/lib/auth';
import { getStore, logEvent, reviewDecisionSchema } from '@/lib/store';
import { MAX_BODY_BYTES } from '@/lib/guard';

/**
 * Persistent review decisions. Reads are public (the decision trail is
 * transparency data); writes require the reviewer session, which is what keeps
 * the shared queue safe from anonymous vandalism while the public demo keeps
 * its session-local behaviour.
 */

const writeSchema = z.object({
  findingId: z.string().min(1).max(40),
  runTarget: z.string().min(1).max(120),
  // 'proposed' reverts the finding: the decision is removed, the log keeps
  // the full history (the audit log is append-only by design).
  status: z.enum(['approved', 'rejected', 'proposed']),
  note: z.string().max(500).optional(),
});

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function GET(req: NextRequest): Promise<Response> {
  const runTarget = req.nextUrl.searchParams.get('target') ?? 'sample-app';
  if (runTarget.length > 120) return json({ error: 'invalid_request' }, 400);
  const decisions = await getStore().listDecisions(runTarget);
  return json({ decisions }, 200);
}

export async function POST(req: NextRequest): Promise<Response> {
  if (!sameOrigin(req)) return json({ error: 'forbidden' }, 403);
  const role = await resolveRole(req.cookies.get(SESSION_COOKIE)?.value);
  if (role !== 'reviewer') return json({ error: 'forbidden' }, 403);

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: 'too_large' }, 413);
  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(raw);
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const parsed = writeSchema.safeParse(parsedBody);
  if (!parsed.success) return json({ error: 'invalid_request' }, 400);

  if (parsed.data.status === 'proposed') {
    await getStore().deleteDecision(parsed.data.runTarget, parsed.data.findingId);
    logEvent({
      ts: new Date().toISOString(),
      actor: 'reviewer',
      action: 'review_decide',
      detail: `reset ${parsed.data.findingId} on ${parsed.data.runTarget} to proposed`,
    });
    return json({ reset: true }, 200);
  }

  const decision = reviewDecisionSchema.parse({
    ...parsed.data,
    status: parsed.data.status,
    reviewer: 'reviewer',
    decidedAt: new Date().toISOString(),
  });
  await getStore().saveDecision(decision);
  logEvent({
    ts: decision.decidedAt,
    actor: 'reviewer',
    action: 'review_decide',
    detail: `${decision.status} ${decision.findingId} on ${decision.runTarget}`,
  });
  return json({ decision }, 200);
}
