import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site';

export const alt = `${siteConfig.name}: ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// The scale mark, drawn once and embedded so Satori renders it as a flat image.
const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="#5eead4" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="8.5" r="1.7" fill="#5eead4" stroke="none"/><path d="M24 8.5V40"/><path d="M8 12H40"/><path d="M8 12 4 20M8 12 12 20"/><path d="M4 20q4 5.5 8 0"/><path d="M40 12 36 20M40 12 44 20"/><path d="M36 20q4 5.5 8 0"/><path d="M24 40 19 43M24 40 29 43M16 43h16"/></svg>`;

export default function OpengraphImage() {
  const mark = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString('base64')}`;
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        background: '#0a0a0f',
        color: '#e8e8ef',
        padding: '72px',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
        {}
        <img src={mark} width={76} height={76} alt="" />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <span style={{ fontSize: '44px', fontWeight: 700, letterSpacing: '10px' }}>MIZAN</span>
          <span style={{ fontSize: '36px', color: '#5eead4' }}>ميزان</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div
          style={{
            display: 'flex',
            fontSize: '20px',
            letterSpacing: '7px',
            textTransform: 'uppercase',
            color: '#5eead4',
          }}
        >
          Governed agentic AI for regulated workflows
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: '58px',
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: '940px',
          }}
        >
          {siteConfig.tagline}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            fontSize: '21px',
            color: '#9a9aad',
          }}
        >
          <span style={{ display: 'flex' }}>No citation, no answer</span>
          <span style={{ display: 'flex', color: '#5eead4' }}>&bull;</span>
          <span style={{ display: 'flex' }}>No human approval, no finding</span>
        </div>
        <div style={{ display: 'flex', fontSize: '22px', color: '#5eead4' }}>
          audit.mohamedattwa.com
        </div>
      </div>
    </div>,
    { ...size }
  );
}
