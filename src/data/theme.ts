/**
 * WanderIndia Design System — Single source of truth for all design tokens.
 *
 * Usage:
 *   import { theme } from '@/data/theme';
 *   theme.colors.coral   // '#D4654A'
 *   theme.fonts.heading   // 'PlayfairDisplay_700Bold'
 */

export const theme = Object.freeze({
  /* ── Colour palette ─────────────────────────────────────────────── */
  colors: Object.freeze({
    /** Warm cream background */
    cream: '#FDF6EE',
    /** Dark‑brown sidebar / nav */
    sidebarDark: '#3D3028',
    /** Coral accent — CTAs, highlights */
    coral: '#D4654A',
    /** Charcoal — headings, primary text */
    charcoal: '#2C2420',
    /** Warm gray — subtitles, secondary text */
    warmGray: '#8A7E74',
    /** Pure white — text on dark overlays, cards */
    white: '#FFFFFF',
    /** Semi‑transparent white for badges */
    badgeBg: 'rgba(255,255,255,0.2)',
    /** Heavy dark overlay for hero images */
    overlayDark: 'rgba(44,36,32,0.7)',
    /** Light dark overlay for cards */
    overlayLight: 'rgba(44,36,32,0.4)',
  }),

  /* ── Typography ─────────────────────────────────────────────────── */
  fonts: Object.freeze({
    /** Serif bold — section headings, hero titles */
    heading: 'PlayfairDisplay_700Bold' as const,
    /** Serif regular — pull‑quotes, decorative text */
    headingRegular: 'PlayfairDisplay_400Regular' as const,
    /** Sans‑serif regular — body copy */
    body: 'Inter_400Regular' as const,
    /** Sans‑serif medium — labels, nav items */
    bodyMedium: 'Inter_500Medium' as const,
    /** Sans‑serif semi‑bold — buttons, badges */
    bodySemiBold: 'Inter_600SemiBold' as const,
    /** Sans‑serif bold — emphasis, counts */
    bodyBold: 'Inter_700Bold' as const,
  }),

  /* ── Spacing scale (4‑point grid) ───────────────────────────────── */
  spacing: Object.freeze({
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  }),

  /* ── Border radii ───────────────────────────────────────────────── */
  borderRadius: Object.freeze({
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  }),
});

/* ── Derived helper types ─────────────────────────────────────────── */
export type Theme = typeof theme;
export type ThemeColors = keyof Theme['colors'];
export type ThemeFonts = keyof Theme['fonts'];
export type ThemeSpacing = keyof Theme['spacing'];
export type ThemeBorderRadius = keyof Theme['borderRadius'];
