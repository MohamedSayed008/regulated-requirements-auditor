'use client';

import { type FormEvent, useRef, useState } from 'react';
import { Box, Button, HStack, Input, Link, Stack, Text } from '@chakra-ui/react';
import { type CorpusOption, CorpusToggle } from '@/components/CorpusToggle';
import { type Lang, localePath, translations } from '@/lib/i18n';

type Segment =
  { kind: 'text'; text: string } | { kind: 'citation'; unitId: string; citedText: string };

/**
 * The prompt forbids markdown, but a model can still slip emphasis markers in;
 * they would render literally, so drop them. Safe on plain prose: legal text in
 * this corpus never uses ** or backticks.
 */
function stripMarkdownMarkers(text: string): string {
  return text.replace(/\*\*|__|`/g, '');
}

type Status = 'idle' | 'streaming' | 'done' | 'error';

export default function AskClient({
  corpusOptions,
  defaultCorpusId,
  initialQuestion = '',
  lang = 'en',
}: {
  corpusOptions: CorpusOption[];
  defaultCorpusId: string;
  initialQuestion?: string;
  lang?: Lang;
}) {
  const t = translations[lang].ask;
  const tCorpus = translations[lang].requirements.corpusLabel;
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
        body: JSON.stringify({ question: trimmed, corpusId, lang }),
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
    <Box as="section" aria-label={t.sectionAria}>
      {corpusOptions.length > 1 && (
        <Box mb="4">
          <CorpusToggle
            options={corpusOptions}
            value={corpusId}
            onChange={setCorpusId}
            label={tCorpus}
          />
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
            placeholder={t.placeholder}
            maxLength={500}
            aria-label={t.inputAria}
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
            {status === 'streaming' ? t.submitting : t.submit}
          </Button>
        </Stack>
      </form>
      <Text mt="3" fontSize="xs" color="fg.subtle">
        {t.aiNote}
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
            {t.streaming}
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
            {t.errors[errorKey] ?? t.errors.default}
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
                {stripMarkdownMarkers(segment.text)}
              </Text>
            ) : (
              <Link
                key={i}
                href={`${localePath(lang, '/requirements')}#${segment.unitId}`}
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
