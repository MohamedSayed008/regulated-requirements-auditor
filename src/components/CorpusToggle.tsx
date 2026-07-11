'use client';

import { Box, Button, HStack, Text } from '@chakra-ui/react';

export interface CorpusOption {
  id: string;
  shortName: string;
}

export function CorpusToggle({
  options,
  value,
  onChange,
}: {
  options: CorpusOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <Box>
      <Text fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="fg.subtle" mb="2">
        Corpus
      </Text>
      <HStack
        gap="1"
        borderWidth="1px"
        borderColor="border.default"
        rounded="lg"
        p="1"
        display="inline-flex"
        bg="bg.panel"
      >
        {options.map(opt => {
          const active = opt.id === value;
          return (
            <Button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              size="sm"
              px="3"
              rounded="md"
              fontWeight="medium"
              bg={active ? 'accent.solid' : 'transparent'}
              color={active ? 'white' : 'fg.muted'}
              _hover={active ? { bg: 'teal.600' } : { color: 'fg.default', bg: 'bg.subtle' }}
            >
              {opt.shortName}
            </Button>
          );
        })}
      </HStack>
    </Box>
  );
}
