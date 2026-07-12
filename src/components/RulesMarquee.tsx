import { Box, HStack, Text } from '@chakra-ui/react';

/** The three non-negotiables the whole product is built on. */
const RULES = [
  'No citation, no answer',
  'No human approval, no finding',
  'No eval report, no release',
];

/**
 * A slow marquee of the governing rules, separated by the rub-el-hizb mark.
 * The strip is duplicated (second copy aria-hidden) so the loop is seamless;
 * reduced motion freezes it via the global animation kill switch.
 */
export function RulesMarquee() {
  return (
    <Box
      role="group"
      aria-label="The three governing rules"
      borderYWidth="1px"
      borderColor="border.default"
      py="4"
      overflow="hidden"
      bg="bg.panel"
      // WCAG 2.2.2: moving content pauses under the pointer or keyboard focus.
      css={{ '&:hover > div, &:focus-within > div': { animationPlayState: 'paused' } }}
    >
      <Box
        display="flex"
        w="max-content"
        animation="marquee 26s linear infinite"
        _motionReduce={{ animation: 'none' }}
      >
        <RuleStrip />
        <RuleStrip hidden />
      </Box>
    </Box>
  );
}

function RuleStrip({ hidden }: { hidden?: boolean }) {
  return (
    <HStack gap="11" pe="11" aria-hidden={hidden ? 'true' : undefined}>
      {RULES.map(rule => (
        <HStack key={rule} gap="11">
          <Text fontFamily="heading" fontSize="sm" color="fg.muted" whiteSpace="nowrap">
            {rule}
          </Text>
          <Text color="law.fg" aria-hidden="true">
            &#1758;
          </Text>
        </HStack>
      ))}
    </HStack>
  );
}
