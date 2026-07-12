'use client';

import { type ReactNode } from 'react';
import { Box, type BoxProps } from '@chakra-ui/react';
import { useInViewOnce } from '@/hooks/useInViewOnce';

/**
 * Reveal-on-scroll wrapper: renders hidden (.rv, styled in theme globalCss) and
 * adds .in once the element enters the viewport. `delay` staggers siblings.
 * Under prefers-reduced-motion the global CSS shows content immediately.
 */
export function Reveal({
  children,
  delay = 0,
  ...props
}: BoxProps & { children: ReactNode; delay?: number }) {
  const [ref, entered] = useInViewOnce<HTMLDivElement>('0px 0px -8% 0px');

  return (
    <Box
      ref={ref}
      className={entered ? 'rv in' : 'rv'}
      style={{ transitionDelay: entered ? `${delay}ms` : undefined }}
      {...props}
    >
      {children}
    </Box>
  );
}
