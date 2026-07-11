import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

/**
 * Mizan theme: dark-first, teal accent. Semantic tokens keep the palette in
 * one place so pages read `bg="bg.panel"` / `color="fg.muted"` rather than
 * hardcoded colors.
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
      },
      fonts: {
        heading: { value: 'var(--font-geist-mono), ui-monospace, monospace' },
        body: { value: 'var(--font-geist-sans), system-ui, sans-serif' },
      },
    },
    semanticTokens: {
      colors: {
        'bg.canvas': { value: { base: '#0a0a0f', _dark: '#0a0a0f' } },
        'bg.panel': { value: { base: '#12121a', _dark: '#12121a' } },
        'bg.subtle': { value: { base: '#191926', _dark: '#191926' } },
        'fg.default': { value: { base: '#e8e8ef', _dark: '#e8e8ef' } },
        'fg.muted': { value: { base: '#9a9aad', _dark: '#9a9aad' } },
        'fg.subtle': { value: { base: '#6b6b80', _dark: '#6b6b80' } },
        'border.default': { value: { base: '#26263a', _dark: '#26263a' } },
        'accent.fg': { value: '{colors.teal.300}' },
        'accent.solid': { value: '{colors.teal.700}' },
        'accent.muted': { value: '{colors.teal.950}' },
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
