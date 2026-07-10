import { Box, Button, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';

export default function Home() {
  return (
    <Box
      minH="100dvh"
      bg="bg.canvas"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px="6"
    >
      <VStack gap="6" textAlign="center" maxW="2xl">
        <Text
          fontSize="sm"
          fontWeight="semibold"
          letterSpacing="0.2em"
          textTransform="uppercase"
          color="accent.fg"
        >
          Coming soon
        </Text>
        <Heading fontFamily="heading" fontSize={{ base: '4xl', sm: '5xl' }} fontWeight="bold">
          Mizan{' '}
          <Text as="span" color="fg.subtle">
            ميزان
          </Text>
        </Heading>
        <Text fontSize="lg" color="fg.muted">
          A regulated requirements auditor: ask questions about the regulation and get the exact
          clause cited, audit code against the requirements, and approve every finding before it
          counts. Evals published with every release.
        </Text>
        <Text fontSize="sm" color="fg.subtle">
          No citation, no answer. No human approval, no finding.
        </Text>
        <HStack gap="3" flexWrap="wrap" justify="center">
          <Button asChild bg="accent.solid" color="white" _hover={{ bg: 'teal.600' }}>
            <NextLink href="/ask">Ask with citations</NextLink>
          </Button>
          <Button
            asChild
            variant="outline"
            borderColor="accent.solid"
            color="accent.fg"
            _hover={{ bg: 'accent.muted' }}
          >
            <NextLink href="/requirements">Browse the corpus</NextLink>
          </Button>
          <Button
            asChild
            variant="outline"
            borderColor="accent.solid"
            color="accent.fg"
            _hover={{ bg: 'accent.muted' }}
          >
            <NextLink href="/audit">See a code audit</NextLink>
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
