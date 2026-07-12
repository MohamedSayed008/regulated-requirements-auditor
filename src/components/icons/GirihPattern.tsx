import { type SVGProps } from 'react';

/**
 * A tiled girih lattice (the eight-point khatam star, two overlapping squares).
 * Purely decorative texture; strokes inherit currentColor so callers set the
 * hue and opacity. Always hidden from assistive tech.
 */
export function GirihPattern({ tile = 56, ...props }: SVGProps<SVGSVGElement> & { tile?: number }) {
  const center = tile / 2;
  const inset = tile * 0.25;
  const side = tile * 0.5;
  return (
    <svg aria-hidden="true" width="100%" height="100%" {...props}>
      <defs>
        <pattern id="mizan-girih" width={tile} height={tile} patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth={1}>
            <rect x={inset} y={inset} width={side} height={side} />
            <rect
              x={inset}
              y={inset}
              width={side}
              height={side}
              transform={`rotate(45 ${center} ${center})`}
            />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mizan-girih)" />
    </svg>
  );
}
