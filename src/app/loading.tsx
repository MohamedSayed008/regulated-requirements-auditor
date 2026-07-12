import { Box, Stack, Text } from '@chakra-ui/react';
import { MizanMark } from '@/components/icons/MizanMark';

export default function Loading() {
  return (
    <Box minH="60vh" display="flex" alignItems="center" justifyContent="center">
      <Stack align="center" gap="3">
        <Box
          color="law.fg"
          animation="mizanRise 0.9s ease-in-out infinite alternate"
          css={{ '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }}
        >
          <MizanMark width="40" height="40" />
        </Box>
        <Text fontFamily="heading" fontSize="xs" letterSpacing="wide" color="fg.subtle">
          Weighing
        </Text>
      </Stack>
    </Box>
  );
}
