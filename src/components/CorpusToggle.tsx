'use client';

import { Box, Button, HStack, Text } from '@chakra-ui/react';

export interface CorpusOption {
  id: string;
  shortName: string;
}

/** Segmented pill switch between corpora; active pill is solid teal. */
export function CorpusToggle({
  options,
  value,
  onChange,
  label = 'Corpus',
}: {
  options: CorpusOption[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  return (
    <Box>
      <Text
        fontFamily="heading"
        fontSize="xs"
        textTransform="uppercase"
        letterSpacing="wide"
        color="fg.subtle"
        mb="2"
      >
        {label}
      </Text>
      <HStack gap="2.5" flexWrap="wrap">
        {options.map(opt => {
          const active = opt.id === value;
          return (
            <Button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              size="sm"
              rounded="full"
              px="4"
              fontWeight={active ? '600' : 'normal'}
              bg={active ? 'accent.fg' : 'transparent'}
              color={active ? 'bg.canvas' : 'fg.muted'}
              borderWidth="1px"
              borderColor={active ? 'accent.fg' : 'border.default'}
              transition="all 0.2s"
              _hover={
                active ? { bg: 'teal.400' } : { color: 'fg.default', borderColor: 'accent.solid' }
              }
            >
              {opt.shortName}
            </Button>
          );
        })}
      </HStack>
    </Box>
  );
}
