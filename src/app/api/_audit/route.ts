import { NextRequest } from 'next/server';
import { runAudit } from '@/lib/audit-engine';

// Temporary, token-guarded trigger used to generate the cached audit run from
// the deployment (where ANTHROPIC_API_KEY lives). Not linked from any page.
// Removed once latest-run.json is committed.

export const maxDuration = 120;

export async function POST(req: NextRequest): Promise<Response> {
  const token = process.env.AUDIT_TOKEN;
  if (!token || req.headers.get('x-audit-token') !== token) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'not_configured' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }
  const run = await runAudit();
  return new Response(JSON.stringify(run, null, 2), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
