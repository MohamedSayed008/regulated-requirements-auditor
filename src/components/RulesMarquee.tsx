import { Box, HStack, Text } from '@chakra-ui/react';
import { type Lang, translations } from '@/lib/i18n';

/**
 * A slow marquee of the governing rules, separated by the rub-el-hizb mark.
 * The strip is duplicated (second copy aria-hidden) so the loop is seamless;
 * reduced motion freezes it via the global animation kill switch.
 */
export function RulesMarquee({ lang = 'en' }: { lang?: Lang }) {
  const t = translations[lang].home;
  return (
    <Box
      role="group"
      aria-label={t.rulesAria}
      borderYWidth="1px"
      borderColor="border.default"
      py="4"
      overflow="hidden"
      bg="bg.panel"
      // WCAG 2.2.2: moving content pauses under the pointer or keyboard focus.
      css={{ '&:hover > div, &:focus-within > div': { animationPlayState: 'paused' } }}
    >
      <Box
        dir="ltr"
        display="flex"
        w="max-content"
        animation="marquee 26s linear infinite"
        _motionReduce={{ animation: 'none' }}
      >
        <RuleStrip rules={t.rules} />
        <RuleStrip rules={t.rules} hidden />
      </Box>
    </Box>
  );
}

function RuleStrip({ rules, hidden }: { rules: string[]; hidden?: boolean }) {
  return (
    <HStack gap="11" pe="11" aria-hidden={hidden ? 'true' : undefined}>
      {rules.map(rule => (
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
