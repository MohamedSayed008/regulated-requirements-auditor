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
 */
const config = defineConfig({
  theme: {
    keyframes: {
      mizanRise: {
        from: { opacity: '0', transform: 'translateY(10px)' },
        to: { opacity: '1', transform: 'translateY(0)' },
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
          300: { value: '#e8cf88' },
          400: { value: '#d4af5a' },
          600: { value: '#a67c2e' },
          700: { value: '#835f22' },
          900: { value: '#3a2c12' },
          950: { value: '#241a0a' },
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
        'bg.canvas': { value: { base: '#0d0b08', _dark: '#0d0b08' } },
        'bg.panel': { value: { base: '#17130d', _dark: '#17130d' } },
        'bg.subtle': { value: { base: '#201a12', _dark: '#201a12' } },
        'fg.default': { value: { base: '#f2ece0', _dark: '#f2ece0' } },
        'fg.muted': { value: { base: '#b0a691', _dark: '#b0a691' } },
        'fg.subtle': { value: { base: '#79705d', _dark: '#79705d' } },
        'border.default': { value: { base: '#2e2618', _dark: '#2e2618' } },
        // teal = the code / verification side
        'accent.fg': { value: '{colors.teal.300}' },
        'accent.solid': { value: '{colors.teal.700}' },
        'accent.muted': { value: '{colors.teal.950}' },
        // gold = the law / justice side
        'law.fg': { value: '{colors.gold.300}' },
        'law.solid': { value: '{colors.gold.600}' },
        'law.muted': { value: '{colors.gold.950}' },
      },
    },
  },
  globalCss: {
    'html, body': {
      bg: 'bg.canvas',
      color: 'fg.default',
    },
  },
});

export const system = createSystem(defaultConfig, config);
