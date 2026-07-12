'use client';

import { useEffect, useRef, useState } from 'react';
import { useInViewOnce } from '@/hooks/useInViewOnce';

/**
 * Counts from 0 to `to` (ease-out cubic, ~1.1s) once the element enters the
 * viewport. Jumps straight to the final value under prefers-reduced-motion.
 */
export function CountUp({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const [ref, entered] = useInViewOnce<HTMLSpanElement>();
  const [value, setValue] = useState(0);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!entered) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      frameRef.current = requestAnimationFrame(() => setValue(to));
      return () => cancelAnimationFrame(frameRef.current);
    }
    const duration = 1100;
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(to * ease(progress));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [entered, to]);

  return <span ref={ref}>{value.toFixed(decimals)}</span>;
}
