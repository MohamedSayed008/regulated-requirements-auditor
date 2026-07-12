'use client';

import NextLink from 'next/link';
import { Box, Button, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { Page } from '@/components/ui/shell';
import { MizanMark } from '@/components/icons/MizanMark';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Page>
      <Stack align="center" textAlign="center" gap="6" py="20" maxW="lg" mx="auto">
        <Box color="law.fg">
          <MizanMark width="56" height="56" />
        </Box>
        <Text
          fontFamily="heading"
          fontSize="xs"
          letterSpacing="0.2em"
          textTransform="uppercase"
          color="law.fg"
        >
          Unexpected error
        </Text>
        <Heading fontFamily="serif" fontWeight="500" fontSize="3xl">
          The run did not complete
        </Heading>
        <Text color="fg.muted">
          Something interrupted this page before it could finish. Retry it, or head back home.
        </Text>
        <HStack gap="3" flexWrap="wrap" justify="center">
          <Button
            onClick={reset}
            bg="law.solid"
            color="bg.canvas"
            fontWeight="600"
            _hover={{ bg: 'gold.400' }}
          >
            Try again
          </Button>
          <Button
            asChild
            variant="outline"
            borderColor="accent.solid"
            color="accent.fg"
            _hover={{ bg: 'accent.muted' }}
          >
            <NextLink href="/">Back to home</NextLink>
          </Button>
        </HStack>
      </Stack>
    </Page>
  );
}
