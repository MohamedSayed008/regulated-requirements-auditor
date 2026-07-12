'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Box, type BoxProps } from '@chakra-ui/react';

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
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    // Anything at or above the current viewport shows immediately: hydration
    // can land mid-page (deep links, restored scroll) and those elements would
    // otherwise never intersect.
    if (node.getBoundingClientRect().top < window.innerHeight) {
      frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          frame = requestAnimationFrame(() => setShown(true));
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <Box
      ref={ref}
      className={shown ? 'rv in' : 'rv'}
      style={{ transitionDelay: shown ? `${delay}ms` : undefined }}
      {...props}
    >
      {children}
    </Box>
  );
}
