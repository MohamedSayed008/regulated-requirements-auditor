'use client';

import { type RefObject, useEffect, useRef, useState } from 'react';

/**
 * True once the element has entered the viewport, and never flips back. The
 * shared core of every reveal/count/grow effect:
 *
 * - Elements already at or above the viewport at mount trigger immediately
 *   (deep links and restored scroll would otherwise never intersect).
 * - Below-the-fold elements wait for IntersectionObserver.
 * - State flips inside requestAnimationFrame so effects never set state
 *   synchronously.
 */
export function useInViewOnce<T extends HTMLElement>(
  rootMargin = '0px'
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const enter = () => {
      frame = requestAnimationFrame(() => setEntered(true));
    };
    if (node.getBoundingClientRect().top < window.innerHeight) {
      enter();
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          enter();
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [rootMargin]);

  return [ref, entered];
}
