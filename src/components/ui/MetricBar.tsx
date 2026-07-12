'use client';

import { useEffect, useRef, useState } from 'react';
import { Box } from '@chakra-ui/react';

/**
 * A slim score track whose fill grows (scaleX 0 to 1) when scrolled into view.
 * `value` is 0..1; the fill width encodes it. Gold for law-side metrics, teal
 * for verification metrics. Renders full under prefers-reduced-motion.
 */
export function MetricBar({ value, tone = 'teal' }: { value: number; tone?: 'teal' | 'gold' }) {
  const ref = useRef<HTMLDivElement>(null);
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Reduced motion, or already at/above the viewport (deep link, restored
    // scroll): grow on the next frame instead of waiting to intersect.
    if (reduced || node.getBoundingClientRect().top < window.innerHeight) {
      frame = requestAnimationFrame(() => setGrown(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        frame = requestAnimationFrame(() => setGrown(true));
        observer.disconnect();
      }
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <Box ref={ref} h="1.5" bg="bg.subtle" rounded="full" overflow="hidden">
      <Box
        h="100%"
        w={`${Math.round(value * 100)}%`}
        bg={tone === 'gold' ? 'law.solid' : 'accent.fg'}
        transformOrigin="left"
        transform={grown ? 'scaleX(1)' : 'scaleX(0)'}
        transition="transform 0.9s cubic-bezier(0.2, 0.7, 0.2, 1)"
      />
    </Box>
  );
}
