import { type SVGProps } from 'react';

/**
 * The Mizan mark: a balance scale (ميزان, "the scale"). Strokes inherit
 * currentColor so callers set the hue with `color`. Pass a `title` to expose it
 * to assistive tech; without one it is decorative and hidden.
 */
export function MizanMark({ title, ...props }: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      {...props}
    >
      {title && <title>{title}</title>}
      {/* pivot finial and the central post down to the base */}
      <circle cx="24" cy="8.5" r="1.7" fill="currentColor" stroke="none" />
      <path d="M24 8.5V40" />
      {/* the beam */}
      <path d="M8 12H40" />
      {/* left pan: chains from the beam end down to a shallow bowl */}
      <path d="M8 12 4 20M8 12 12 20" />
      <path d="M4 20q4 5.5 8 0" />
      {/* right pan */}
      <path d="M40 12 36 20M40 12 44 20" />
      <path d="M36 20q4 5.5 8 0" />
      {/* the stand */}
      <path d="M24 40 19 43M24 40 29 43M16 43h16" />
    </svg>
  );
}
