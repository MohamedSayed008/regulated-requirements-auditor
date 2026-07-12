'use client';

import { type FormEvent, useRef, useState } from 'react';
import { Box, Button, HStack, Input, Link, Stack, Text } from '@chakra-ui/react';
import { type CorpusOption, CorpusToggle } from '@/components/CorpusToggle';

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

export default function AskClient({
  corpusOptions,
  defaultCorpusId,
  initialQuestion = '',
}: {
  corpusOptions: CorpusOption[];
  defaultCorpusId: string;
  initialQuestion?: string;
}) {
  const [question, setQuestion] = useState(initialQuestion);
  const [corpusId, setCorpusId] = useState(defaultCorpusId);
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
        body: JSON.stringify({ question: trimmed, corpusId }),
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
    <Box as="section" aria-label="Ask a question">
      {corpusOptions.length > 1 && (
        <Box mb="4">
          <CorpusToggle options={corpusOptions} value={corpusId} onChange={setCorpusId} />
        </Box>
      )}
      <form onSubmit={handleSubmit}>
        <Stack
          direction={{ base: 'column', sm: 'row' }}
          align={{ base: 'stretch', sm: 'center' }}
          gap="2.5"
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border.default"
          rounded="xl"
          p="2"
          ps={{ base: '2', sm: '4' }}
          transition="border-color 0.25s"
          _focusWithin={{ borderColor: 'accent.solid' }}
        >
          <Input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="e.g. How much notice is needed before a rent increase?"
            maxLength={500}
            aria-label="Your question about the regulation"
            variant="outline"
            border="none"
            bg="transparent"
            color="fg.default"
            _placeholder={{ color: 'fg.subtle' }}
            _focus={{ outline: 'none', boxShadow: 'none' }}
            size="lg"
            flex="1"
            px={{ base: '3', sm: '0' }}
          />
          <Button
            type="submit"
            disabled={status === 'streaming' || question.trim().length < 8}
            bg="accent.solid"
            color="white"
            fontWeight="600"
            _hover={{ bg: 'teal.600' }}
            size="lg"
            px="6"
            rounded="lg"
          >
            {status === 'streaming' ? 'Answering' : 'Ask'}
          </Button>
        </Stack>
      </form>
      <Text mt="3" fontSize="xs" color="fg.subtle">
        AI-generated answer. Verify every claim against the cited requirement units before relying
        on it.
      </Text>

      {status === 'streaming' && segments.length === 0 && (
        <HStack
          mt="8"
          gap="2.5"
          borderWidth="1px"
          borderColor="border.default"
          bg="bg.panel"
          rounded="xl"
          p="5"
        >
          <Box
            w="1.5"
            h="1.5"
            rounded="full"
            bg="accent.fg"
            animation="pulseDot 1.2s infinite"
            _motionReduce={{ animation: 'none' }}
          />
          <Text fontSize="sm" color="fg.muted">
            Reading the corpus and grounding the answer
          </Text>
        </HStack>
      )}

      {status === 'error' && (
        <Box
          role="alert"
          mt="8"
          borderWidth="1px"
          borderColor="warn.line"
          bg="warn.bg"
          rounded="xl"
          px="5"
          py="4"
        >
          <Text fontSize="sm" color="warn.fg">
            {ERROR_COPY[errorKey] ?? ERROR_COPY.default}
          </Text>
        </Box>
      )}

      {segments.length > 0 && (
        <Box
          mt="8"
          borderWidth="1px"
          borderColor="border.default"
          bg="bg.panel"
          rounded="2xl"
          p="6"
          fontSize="md"
          lineHeight="1.8"
          color="fg.default"
        >
          {segments.map((segment, i) =>
            segment.kind === 'text' ? (
              <Text as="span" key={i} whiteSpace="pre-line">
                {segment.text}
              </Text>
            ) : (
              <Link
                key={i}
                href={`/requirements#${segment.unitId}`}
                title={segment.citedText}
                mx="1"
                display="inline-flex"
                alignItems="center"
                verticalAlign="middle"
                borderWidth="1px"
                borderColor="accent.solid"
                bg="bg.subtle"
                px="2"
                py="0.5"
                rounded="md"
                fontFamily="heading"
                fontSize="xs"
                color="accent.fg"
                _hover={{ bg: 'accent.muted' }}
              >
                {segment.unitId}
              </Link>
            )
          )}
        </Box>
      )}
    </Box>
  );
}
