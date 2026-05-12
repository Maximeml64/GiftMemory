/**
 * GiftMemory Design System — "Boîte à souvenirs"
 * Direction : prune profond + rose poudré, papier ivoire, typo éditoriale.
 *
 * Typography : Cormorant Garamond (titres, italique élégant) + Inter (UI/body)
 * Palette : monochrome prune avec accent rose poudré et touches dorées
 */

// ─── COLORS ───────────────────────────────────────────────────────────────────

export const COLORS = {
  // Brand
  primary: '#4A1942',
  primaryDark: '#2E0F2A',
  primaryMuted: 'rgba(74, 25, 66, 0.08)',

  // Accent (rose poudré + dérivés)
  accent: '#F5E1E8',
  accentStrong: '#E8B7C5',
  accentMuted: 'rgba(245, 225, 232, 0.50)',

  // Surface
  background: '#FDF9F4',
  surface: '#FFFFFF',
  surfaceAlt: '#FBF4F7',

  // Text (contraste WCAG AA garanti sur fond ivoire)
  text: '#2A1F2E',
  textSecondary: '#6B5A6D',
  textTertiary: '#9C8AA0',
  textInverse: '#FDF9F4',

  // Border
  border: '#EBE0E6',
  borderStrong: '#D9C9D2',

  // Semantic
  danger: '#A82844',
  dangerMuted: 'rgba(168, 40, 68, 0.10)',
  success: '#5A7F4A',
  successMuted: 'rgba(90, 127, 74, 0.10)',
  warning: '#B07D2E',
  warningMuted: 'rgba(176, 125, 46, 0.10)',
  info: '#4A6481',
  infoMuted: 'rgba(74, 100, 129, 0.10)',

  // Overlay
  overlay: 'rgba(42, 31, 46, 0.55)',
} as const;

// ─── FONTS ────────────────────────────────────────────────────────────────────

export const FONTS = {
  serif: 'CormorantGaramond_400Regular',
  serifItalic: 'CormorantGaramond_400Regular_Italic',
  serifMedium: 'CormorantGaramond_500Medium',
  serifSemiBold: 'CormorantGaramond_600SemiBold',
  serifBold: 'CormorantGaramond_700Bold',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
} as const;

// ─── TYPOGRAPHY ───────────────────────────────────────────────────────────────

export const TYPOGRAPHY = {
  // Editorial (Cormorant Garamond)
  display: {
    fontFamily: FONTS.serifItalic,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.5,
    color: COLORS.text,
  },
  h1: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.3,
    color: COLORS.text,
  },
  h2: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.2,
    color: COLORS.text,
  },
  h3: {
    fontFamily: FONTS.serifMedium,
    fontSize: 20,
    lineHeight: 26,
    color: COLORS.text,
  },

  // UI (Inter)
  title: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 17,
    lineHeight: 24,
    color: COLORS.text,
  },
  body: {
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
  },
  bodyMedium: {
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
  },
  small: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
  smallMedium: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.text,
  },
  eyebrow: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    color: COLORS.textSecondary,
  },
  caption: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    lineHeight: 14,
    color: COLORS.textTertiary,
  },

  // Numeric (tabular-nums for countdowns, prices, etc.)
  numericLarge: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 28,
    lineHeight: 32,
    color: COLORS.text,
    fontVariant: ['tabular-nums'] as const,
  },
  numericMedium: {
    fontFamily: FONTS.sansMedium,
    fontSize: 17,
    lineHeight: 22,
    color: COLORS.text,
    fontVariant: ['tabular-nums'] as const,
  },
} as const;

// ─── SPACING ──────────────────────────────────────────────────────────────────

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

// ─── RADIUS ───────────────────────────────────────────────────────────────────

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
} as const;

// ─── SHADOWS (papier feutré, ombres douces) ──────────────────────────────────

export const SHADOWS = {
  sm: {
    shadowColor: '#2A1F2E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#2A1F2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: '#2A1F2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  xl: {
    shadowColor: '#2A1F2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

// ─── OCCASIONS (harmonisées avec la palette) ─────────────────────────────────

export const OCCASIONS: Record<
  string,
  { label: string; emoji: string; color: string; bg: string }
> = {
  Anniversaire: { label: 'Anniversaire', emoji: '🎂', color: '#A82864', bg: '#F8E1EC' },
  Noël:         { label: 'Noël',         emoji: '🎄', color: '#3D6B4A', bg: '#E0EDE3' },
  Naissance:    { label: 'Naissance',    emoji: '👶', color: '#4A6481', bg: '#E1EAF2' },
  Mariage:      { label: 'Mariage',      emoji: '💍', color: '#4A1942', bg: '#EBDDE6' },
  Autre:        { label: 'Autre',        emoji: '🎁', color: '#B07D2E', bg: '#F3E8D4' },
} as const;

// ─── EXPORTED DEFAULT THEME ──────────────────────────────────────────────────

export const theme = {
  colors: COLORS,
  fonts: FONTS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
  occasions: OCCASIONS,
} as const;

export type Theme = typeof theme;
export default theme;
