import NextLink from 'next/link';
import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';
import { Page } from '@/components/ui/shell';
import { MizanMark } from '@/components/icons/MizanMark';

export default function NotFound() {
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
          Error 404
        </Text>
        <Heading fontFamily="serif" fontWeight="500" fontSize="3xl">
          This page is out of scope
        </Heading>
        <Text color="fg.muted">
          Like a question outside the corpus, there is nothing here to cite. Head back to something
          grounded.
        </Text>
        <Button
          asChild
          bg="law.solid"
          color="bg.canvas"
          fontWeight="600"
          _hover={{ bg: 'gold.400' }}
        >
          <NextLink href="/">Back to home</NextLink>
        </Button>
      </Stack>
    </Page>
  );
}
