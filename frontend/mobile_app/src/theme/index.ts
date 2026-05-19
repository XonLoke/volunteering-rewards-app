export const colors = {
  bg: { page: '#FFFFFF', card: '#FFFFFF', input: '#F5F5F7', subtle: '#F2F2F5' },
  border: { light: '#E0E0E5', focus: '#007AFF' },
  text: { primary: '#1C1C1E', secondary: '#6C6C70', tertiary: '#AEAEB2', inverse: '#FFFFFF' },
  accent: { green: '#34C759', blue: '#007AFF', orange: '#FF9500', red: '#FF3B30', grey: '#8E8E93' },
  status: { approved: '#34C759', pending: '#FF9500', rejected: '#FF3B30', default: '#8E8E93' },
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const borderRadius = { sm: 4, md: 10, lg: 12 } as const;
export const typography = {
  largeTitle: { fontSize: 34, fontWeight: '700' as const, lineHeight: 41 },
  title1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  title2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  title3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 25 },
  headline: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 17, fontWeight: '400' as const, lineHeight: 22 },
  callout: { fontSize: 16, fontWeight: '400' as const, lineHeight: 21 },
  subhead: { fontSize: 15, fontWeight: '400' as const, lineHeight: 20 },
  footnote: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption1: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  caption2: { fontSize: 11, fontWeight: '500' as const, lineHeight: 13 },
};

export type AppColors = typeof colors;
export type AppSpacing = typeof spacing;
export type AppBorderRadius = typeof borderRadius;
export type AppTypography = typeof typography;
