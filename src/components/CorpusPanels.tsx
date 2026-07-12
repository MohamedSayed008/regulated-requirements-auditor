'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { type CorpusOption, CorpusToggle } from '@/components/CorpusToggle';

/**
 * Client switcher over server-rendered corpus sections: the pills select which
 * panel is visible. Panels arrive fully rendered from the server, so switching
 * is instant and costs no requests.
 *
 * Deep links: citations link to /requirements#<unit-id>, and the unit may live
 * in a hidden panel where fragment navigation cannot scroll. On load and on
 * hashchange, the panel containing the target activates and scrolls to it.
 */
export function CorpusPanels({
  options,
  panels,
}: {
  options: CorpusOption[];
  panels: { id: string; content: ReactNode }[];
}) {
  const [activeId, setActiveId] = useState(options[0]?.id ?? '');

  useEffect(() => {
    const activateFromHash = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (!hash) return;
      const target = document.getElementById(hash);
      const panelId = target?.closest('[data-corpus-panel]')?.getAttribute('data-corpus-panel');
      if (!target || !panelId) return;
      setActiveId(panelId);
      requestAnimationFrame(() => target.scrollIntoView());
    };
    const frame = requestAnimationFrame(activateFromHash);
    window.addEventListener('hashchange', activateFromHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', activateFromHash);
    };
  }, []);

  return (
    <Box>
      <Box mb="8">
        <CorpusToggle options={options} value={activeId} onChange={setActiveId} />
      </Box>
      {panels.map(panel => (
        <Box
          key={panel.id}
          data-corpus-panel={panel.id}
          display={panel.id === activeId ? 'block' : 'none'}
        >
          {panel.content}
        </Box>
      ))}
    </Box>
  );
}
