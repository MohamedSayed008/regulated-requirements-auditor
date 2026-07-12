'use client';

import { Box } from '@chakra-ui/react';
import { useInViewOnce } from '@/hooks/useInViewOnce';

/**
 * A slim score track whose fill grows (scaleX 0 to 1) once it enters the
 * viewport. `value` is 0..1; the fill width encodes it. Gold for law-side
 * metrics, teal for verification metrics. Reduced motion skips the transition
 * via the global animation kill switch.
 */
export function MetricBar({ value, tone = 'teal' }: { value: number; tone?: 'teal' | 'gold' }) {
  const [ref, entered] = useInViewOnce<HTMLDivElement>();

  return (
    <Box ref={ref} h="1.5" bg="bg.subtle" rounded="full" overflow="hidden">
      <Box
        h="100%"
        w={`${Math.round(value * 100)}%`}
        bg={tone === 'gold' ? 'law.solid' : 'accent.fg'}
        transformOrigin="left"
        transform={entered ? 'scaleX(1)' : 'scaleX(0)'}
        transition="transform 0.9s cubic-bezier(0.2, 0.7, 0.2, 1)"
        _motionReduce={{ transition: 'none' }}
      />
    </Box>
  );
}
