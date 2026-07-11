import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import {
  ASK_MODEL,
  MAX_ANSWER_TOKENS,
  SYSTEM_PROMPT,
  askRequestSchema,
  buildCorpusDocuments,
  unitIdAt,
} from '@/lib/ask';
import { MAX_BODY_BYTES, isDemoDisabled } from '@/lib/guard';
import { checkAskRateLimit } from '@/lib/rate-limit';

export const maxDuration = 60;

const corpusDocuments = buildCorpusDocuments();

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  if (isDemoDisabled()) {
    return json({ error: 'demo_disabled' }, 503);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return json({ error: 'not_configured' }, 503);
  }

  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return json({ error: 'unsupported_media_type' }, 415);
  }

  const contentLength = Number(req.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json({ error: 'too_large' }, 413);
  }
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json({ error: 'too_large' }, 413);
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(raw);
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const parsed = askRequestSchema.safeParse(parsedBody);
  if (!parsed.success) {
    return json({ error: 'invalid_question' }, 400);
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rate = await checkAskRateLimit(ip);
  if (!rate.ok) {
    return json({ error: 'rate_limited' }, 429);
  }

  const anthropic = new Anthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      try {
        const messageStream = anthropic.messages.stream({
          model: ASK_MODEL,
          max_tokens: MAX_ANSWER_TOKENS,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: [...corpusDocuments, { type: 'text', text: parsed.data.question }],
            },
          ],
        });

        for await (const event of messageStream) {
          if (event.type !== 'content_block_delta') continue;
          if (event.delta.type === 'text_delta') {
            send({ type: 'text', text: event.delta.text });
          } else if (event.delta.type === 'citations_delta') {
            const citation = event.delta.citation;
            const index = 'document_index' in citation ? citation.document_index : -1;
            const unitId = unitIdAt(index);
            if (unitId) {
              send({
                type: 'citation',
                unitId,
                citedText: 'cited_text' in citation ? citation.cited_text : '',
              });
            }
          }
        }

        const final = await messageStream.finalMessage();
        send({
          type: 'done',
          usage: {
            inputTokens: final.usage.input_tokens,
            outputTokens: final.usage.output_tokens,
            cacheReadTokens: final.usage.cache_read_input_tokens ?? 0,
            cacheWriteTokens: final.usage.cache_creation_input_tokens ?? 0,
          },
        });
      } catch (error: unknown) {
        if (error instanceof Anthropic.RateLimitError) {
          send({ type: 'error', error: 'upstream_rate_limited' });
        } else if (error instanceof Anthropic.APIError) {
          console.error('ask: anthropic api error', error.status, error.message);
          send({ type: 'error', error: 'upstream_error' });
        } else {
          console.error('ask: unexpected error', error);
          send({ type: 'error', error: 'unexpected' });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
    },
  });
}
