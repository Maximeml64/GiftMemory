// src/utils/theme.ts

export const Colors = {
  background: '#FFF8F0',
  surface: '#FFFFFF',
  primary: '#E8734A',
  primaryLight: '#F5A882',
  primaryDark: '#C45A33',
  secondary: '#4A7E8C',
  accent: '#F2C94C',
  text: '#1A1A2E',
  textSecondary: '#6B6B8A',
  textTertiary: '#A0A0B8',
  border: '#EDE8E0',
  cardBg: '#FFFFFF',
  danger: '#E05A5A',
  dangerLight: '#FFF0F0',
  success: '#5A9E6F',
  overlay: 'rgba(26, 26, 46, 0.5)',
  shimmer: '#F5EFE6',
};

export const Occasions: Record<string, { label: string; emoji: string; color: string }> = {
  Anniversaire: { label: 'Anniversaire', emoji: '🎂', color: '#E8734A' },
  Noël: { label: 'Noël', emoji: '🎄', color: '#5A9E6F' },
  Naissance: { label: 'Naissance', emoji: '👶', color: '#7B9FE8' },
  Mariage: { label: 'Mariage', emoji: '💍', color: '#C48BCE' },
  Autre: { label: 'Autre', emoji: '🎁', color: '#F2C94C' },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  displayLarge: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  displayMedium: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  titleLarge: { fontSize: 20, fontWeight: '600' as const },
  titleMedium: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, fontWeight: '500' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  captionMedium: { fontSize: 12, fontWeight: '500' as const },
};

export const Shadow = {
  sm: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};
