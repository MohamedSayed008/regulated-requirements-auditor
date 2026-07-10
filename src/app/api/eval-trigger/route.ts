import { NextRequest } from 'next/server';
import { runEvals } from '@/lib/eval-engine';

// Temporary, token-guarded trigger to generate the cached eval report from the
// deployment (where ANTHROPIC_API_KEY lives). Removed once report.json is
// committed.

export const maxDuration = 300;

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
  const report = await runEvals();
  return new Response(JSON.stringify(report, null, 2), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
