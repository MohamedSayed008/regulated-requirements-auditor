'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Counts from 0 to `to` (ease-out cubic, ~1.1s) once the element scrolls into
 * view. Renders the final value immediately under prefers-reduced-motion.
 */
export function CountUp({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const run = () => {
      // Under reduced motion, jump straight to the final value (one deferred set).
      if (reduced) {
        frame = requestAnimationFrame(() => setValue(to));
        return;
      }
      const duration = 1100;
      const start = performance.now();
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        setValue(to * ease(progress));
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };
    // Already at or above the viewport (deep link, restored scroll): count now.
    if (reduced || node.getBoundingClientRect().top < window.innerHeight) {
      run();
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      observer.disconnect();
      run();
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to]);

  return <span ref={ref}>{value.toFixed(decimals)}</span>;
}
