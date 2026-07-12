import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

/**
 * Mizan theme: warm-ink, bilingual, with a two-sided accent that carries the
 * product's thesis. Brass/gold is "the law" (the scale of justice); teal is
 * "the code" (verification). Semantic tokens keep the palette in one place so
 * pages read `bg="bg.panel"` / `color="law.fg"` rather than hardcoded colors.
 *
 * Font roles: `serif` (Spectral) is the law voice, `heading` (Geist Mono) is
 * the code/data voice, `arabic` (Amiri) is the bilingual display face, `body`
 * (Geist Sans) is reading text.
 *
 * Motion: one shared reveal (`.rv` / `.rv.in`, driven by the Reveal component)
 * plus the balance animations (swayBeam, floatPan), the rules marquee, and the
 * small pulse/blink/count effects. All are disabled under reduced motion.
 */
const config = defineConfig({
  theme: {
    keyframes: {
      mizanRise: {
        from: { opacity: '0', transform: 'translateY(10px)' },
        to: { opacity: '1', transform: 'translateY(0)' },
      },
      swayBeam: {
        '0%, 100%': { transform: 'rotate(-4deg)' },
        '50%': { transform: 'rotate(4deg)' },
      },
      floatPan: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(4px)' },
      },
      floatPanAlt: {
        '0%, 100%': { transform: 'translateY(4px)' },
        '50%': { transform: 'translateY(0)' },
      },
      marquee: {
        '0%': { transform: 'translateX(0)' },
        '100%': { transform: 'translateX(-50%)' },
      },
      pulseDot: {
        '0%, 100%': { opacity: '0.3' },
        '50%': { opacity: '1' },
      },
      blink: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0' },
      },
    },
    tokens: {
      colors: {
        teal: {
          300: { value: '#5eead4' },
          400: { value: '#2dd4bf' },
          600: { value: '#0d9488' },
          700: { value: '#0f766e' },
          900: { value: '#134e4a' },
          950: { value: '#042f2e' },
        },
        gold: {
          300: { value: '#e6cd86' },
          400: { value: '#d3ae57' },
          600: { value: '#a67c2e' },
          700: { value: '#835f22' },
          900: { value: '#4a2f0a' },
          950: { value: '#2a1c08' },
        },
      },
      fonts: {
        heading: { value: 'var(--font-geist-mono), ui-monospace, monospace' },
        body: { value: 'var(--font-geist-sans), system-ui, sans-serif' },
        serif: { value: 'var(--font-spectral), Georgia, "Times New Roman", serif' },
        arabic: { value: 'var(--font-amiri), "Times New Roman", serif' },
      },
    },
    semanticTokens: {
      colors: {
        // Light values first (base), the dark palette under _dark. Dark is the
        // default via next-themes; the toggle flips the html class.
        'bg.canvas': { value: { base: '#f7f2e8', _dark: '#0c0a07' } },
        'bg.panel': { value: { base: '#fffdf6', _dark: '#151009' } },
        'bg.subtle': { value: { base: '#efe7d6', _dark: '#1e1810' } },
        'fg.default': { value: { base: '#211a0f', _dark: '#f4efe4' } },
        'fg.muted': { value: { base: '#6b6047', _dark: '#b3a890' } },
        'fg.subtle': { value: { base: '#7c714f', _dark: '#7b715c' } },
        'border.default': { value: { base: '#e5dcc7', _dark: '#2c2417' } },
        'nav.bg': {
          value: { base: 'rgba(247, 242, 232, 0.82)', _dark: 'rgba(12, 10, 7, 0.72)' },
        },
        // teal = the code / verification side
        'accent.fg': { value: { base: '#0d7a70', _dark: '{colors.teal.300}' } },
        'accent.solid': { value: { base: '#0d9488', _dark: '{colors.teal.700}' } },
        'accent.muted': { value: { base: '#ddefe9', _dark: '{colors.teal.950}' } },
        // hover state for solid-teal controls; keeps AA contrast in both modes
        'accent.emphasis': { value: { base: '#0a6158', _dark: '{colors.teal.400}' } },
        // gold = the law / justice side
        'law.fg': { value: { base: '#8a6413', _dark: '{colors.gold.300}' } },
        'law.solid': { value: { base: '#9c7422', _dark: '{colors.gold.400}' } },
        'law.muted': { value: { base: '#fbf1d8', _dark: '{colors.gold.950}' } },
        'law.line': { value: { base: '#e6cf98', _dark: '{colors.gold.900}' } },
        // warnings / errors
        'warn.fg': { value: { base: '#b42318', _dark: '#fca5a5' } },
        'warn.bg': { value: { base: '#fdeceb', _dark: '#2a1010' } },
        'warn.line': { value: { base: '#f1c4c1', _dark: '#5a1f1f' } },
        // syntax accents in code excerpts
        'code.kw': { value: { base: '#7c3aed', _dark: '#c084fc' } },
        'code.num': { value: { base: '#be185d', _dark: '#f0abfc' } },
        // status numerals and accents
        'success.fg': { value: { base: '#15803d', _dark: '#86efac' } },
        'success.line': { value: { base: '#b7dcc2', _dark: '#1c3b2a' } },
        'warning.fg': { value: { base: '#b45309', _dark: '#fdba74' } },
      },
    },
  },
  globalCss: {
    'html, body': {
      bg: 'bg.canvas',
      color: 'fg.default',
    },
    '::selection': {
      bg: 'accent.solid',
      color: 'white',
    },
    // Shared reveal-on-scroll. The Reveal component toggles `.in`. Animated
    // components opt out individually via _motionReduce.
    '.rv': {
      opacity: 0,
      transform: 'translateY(22px)',
      transition:
        'opacity 0.65s cubic-bezier(0.2, 0.7, 0.2, 1), transform 0.65s cubic-bezier(0.2, 0.7, 0.2, 1)',
      '@media (prefers-reduced-motion: reduce)': {
        opacity: 1,
        transform: 'none',
        transition: 'none',
      },
    },
    '.rv.in': {
      opacity: 1,
      transform: 'none',
    },
  },
});

export const system = createSystem(defaultConfig, config);
