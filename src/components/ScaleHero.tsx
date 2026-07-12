import { Box, Text } from '@chakra-ui/react';

/**
 * The hero balance, drawn from primitives: pivot, post, swaying beam with a
 * gold LAW pan and a teal CODE pan (counter-floating), base, and a large faint
 * Amiri watermark behind. Pure CSS animation; hidden from assistive tech (the
 * headline carries the meaning) and frozen under reduced motion globally.
 */
export function ScaleHero() {
  return (
    <Box position="relative" w="340px" h="340px" aria-hidden="true">
      <Box
        position="absolute"
        inset="-20%"
        bg="radial-gradient(circle, rgba(230, 205, 134, 0.10), transparent 65%)"
        pointerEvents="none"
      />
      <Text
        position="absolute"
        top="34px"
        left="50%"
        transform="translateX(-50%)"
        fontFamily="arabic"
        fontSize="120px"
        color="law.fg"
        opacity="0.1"
        lineHeight="1"
      >
        ميزان
      </Text>

      <Box position="absolute" inset="0" color="law.fg">
        {/* post and pivot */}
        <Box
          position="absolute"
          top="60px"
          left="50%"
          w="2px"
          h="200px"
          bg="currentColor"
          transform="translateX(-50%)"
        />
        <Box
          position="absolute"
          top="56px"
          left="50%"
          transform="translateX(-50%)"
          w="10px"
          h="10px"
          rounded="full"
          bg="currentColor"
        />

        {/* the swaying beam with both pans */}
        <Box
          position="absolute"
          top="70px"
          left="50%"
          transformOrigin="50% 0"
          animation="swayBeam 6s ease-in-out infinite"
          _motionReduce={{ animation: 'none' }}
        >
          <Box position="relative" w="280px" h="2px" bg="currentColor" left="-140px">
            <Pan side="law" />
            <Pan side="code" />
          </Box>
        </Box>

        {/* base */}
        <Box
          position="absolute"
          bottom="36px"
          left="50%"
          transform="translateX(-50%)"
          w="70px"
          h="2px"
          bg="currentColor"
        />
        <Box
          position="absolute"
          bottom="38px"
          left="50%"
          transform="translateX(-50%)"
          w="0"
          h="0"
          borderLeft="20px solid transparent"
          borderRight="20px solid transparent"
          borderBottom="44px solid"
          borderBottomColor="law.fg"
          opacity="0.18"
        />
      </Box>
    </Box>
  );
}

function Pan({ side }: { side: 'law' | 'code' }) {
  const isLaw = side === 'law';
  return (
    <Box
      position="absolute"
      top="0"
      {...(isLaw ? { left: '0' } : { right: '0' })}
      w="70px"
      transform={isLaw ? 'translateX(-50%)' : 'translateX(50%)'}
      animation={`${isLaw ? 'floatPan' : 'floatPanAlt'} 6s ease-in-out infinite`}
      _motionReduce={{ animation: 'none' }}
    >
      <Box w="2px" h="26px" bg={isLaw ? 'currentColor' : 'accent.solid'} mx="auto" />
      <Box
        w="70px"
        h="30px"
        borderWidth="2px"
        borderTopWidth="0"
        borderColor={isLaw ? 'law.fg' : 'teal.400'}
        roundedBottom="40px"
        bg={isLaw ? 'rgba(230, 205, 134, 0.06)' : 'rgba(20, 184, 166, 0.08)'}
        display="flex"
        alignItems="flex-end"
        justifyContent="center"
        pb="1"
      >
        <Text fontFamily="heading" fontSize="10px" color={isLaw ? 'law.fg' : 'accent.fg'}>
          {isLaw ? 'LAW' : 'CODE'}
        </Text>
      </Box>
    </Box>
  );
}
