'use client';

import { type FormEvent, useRef, useState } from 'react';

type Segment =
  { kind: 'text'; text: string } | { kind: 'citation'; unitId: string; citedText: string };

type Status = 'idle' | 'streaming' | 'done' | 'error';

const ERROR_COPY: Record<string, string> = {
  demo_disabled:
    'The live demo is paused right now (budget cap). Cached runs and the corpus remain available.',
  not_configured: 'The demo backend is not configured yet.',
  rate_limited: 'Rate limit reached. Please try again in a while.',
  upstream_rate_limited: 'The model is busy. Please try again shortly.',
  invalid_question: 'Questions need to be between 8 and 500 characters.',
  default: 'Something went wrong. Please try again.',
};

export default function AskClient() {
  const [question, setQuestion] = useState('');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [errorKey, setErrorKey] = useState<string>('default');
  const abortRef = useRef<AbortController | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (trimmed.length < 8 || status === 'streaming') return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSegments([]);
    setStatus('streaming');

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => ({ error: 'default' }));
        setErrorKey(typeof body.error === 'string' ? body.error : 'default');
        setStatus('error');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const event = JSON.parse(line.slice(6));
          if (event.type === 'text') {
            setSegments(prev => {
              const last = prev[prev.length - 1];
              if (last?.kind === 'text') {
                return [...prev.slice(0, -1), { kind: 'text', text: last.text + event.text }];
              }
              return [...prev, { kind: 'text', text: event.text }];
            });
          } else if (event.type === 'citation') {
            setSegments(prev => [
              ...prev,
              { kind: 'citation', unitId: event.unitId, citedText: event.citedText },
            ]);
          } else if (event.type === 'error') {
            setErrorKey(event.error ?? 'default');
            setStatus('error');
            return;
          } else if (event.type === 'done') {
            setStatus('done');
          }
        }
      }
      setStatus(prev => (prev === 'streaming' ? 'done' : prev));
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setErrorKey('default');
      setStatus('error');
    }
  }

  return (
    <section aria-label="Ask a question">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="e.g. How much notice is needed before a rent increase?"
          maxLength={500}
          aria-label="Your question about Dubai tenancy law"
          className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-teal-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === 'streaming' || question.trim().length < 8}
          className="rounded-lg bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
        >
          {status === 'streaming' ? 'Answering' : 'Ask'}
        </button>
      </form>

      {status === 'streaming' && segments.length === 0 && (
        <p className="mt-6 animate-pulse text-sm text-neutral-500">
          Reading the corpus and grounding the answer
        </p>
      )}

      {status === 'error' && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-300"
        >
          {ERROR_COPY[errorKey] ?? ERROR_COPY.default}
        </p>
      )}

      {segments.length > 0 && (
        <p className="mt-6 text-xs text-neutral-500">
          AI-generated answer. It may contain mistakes: verify every claim against the cited
          requirement units before relying on it.
        </p>
      )}
      {segments.length > 0 && (
        <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-900 p-5 text-sm leading-relaxed">
          {segments.map((segment, i) =>
            segment.kind === 'text' ? (
              <span key={i} className="whitespace-pre-line">
                {segment.text}
              </span>
            ) : (
              <a
                key={i}
                href={`/requirements#${segment.unitId}`}
                title={segment.citedText}
                className="mx-1 inline-block rounded border border-teal-800 bg-teal-950 px-1.5 py-0.5 align-baseline font-mono text-xs text-teal-300 hover:bg-teal-900"
              >
                {segment.unitId}
              </a>
            )
          )}
        </div>
      )}
    </section>
  );
}
