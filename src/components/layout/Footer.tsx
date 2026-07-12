import { Container, Flex, HStack, Text } from '@chakra-ui/react';
import { MizanMark } from '@/components/icons/MizanMark';

export function Footer() {
  return (
    <Flex as="footer" borderTopWidth="1px" borderColor="border.default" bg="bg.panel">
      <Container maxW="6xl" py="10">
        <Flex justify="space-between" align="center" gap="6" flexWrap="wrap">
          <HStack gap="2.5" color="law.fg">
            <MizanMark width="24" height="24" />
            <Text fontFamily="serif" fontSize="md" color="fg.default">
              Mizan
            </Text>
            <Text fontFamily="arabic" fontSize="md" aria-hidden="true">
              ميزان
            </Text>
          </HStack>
          <Text fontSize="xs" color="fg.subtle" maxW="60ch" lineHeight="1.6">
            Demonstration only, not legal advice. Reproduces official public legal texts; where
            Arabic and English conflict, the Arabic prevails. Built by Mohamed Sayed.
          </Text>
        </Flex>
      </Container>
    </Flex>
  );
}
