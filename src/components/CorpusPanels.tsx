'use client';

import { type ReactNode, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { type CorpusOption, CorpusToggle } from '@/components/CorpusToggle';

/**
 * Client switcher over server-rendered corpus sections: the pills select which
 * panel is visible. Panels arrive fully rendered from the server, so switching
 * is instant and costs no requests.
 */
export function CorpusPanels({
  options,
  panels,
}: {
  options: CorpusOption[];
  panels: { id: string; content: ReactNode }[];
}) {
  const [activeId, setActiveId] = useState(options[0]?.id ?? '');
  return (
    <Box>
      <Box mb="8">
        <CorpusToggle options={options} value={activeId} onChange={setActiveId} />
      </Box>
      {panels.map(panel => (
        <Box key={panel.id} display={panel.id === activeId ? 'block' : 'none'}>
          {panel.content}
        </Box>
      ))}
    </Box>
  );
}
