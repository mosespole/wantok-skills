/**
 * Brand palette for Wantok Skills.
 * Forest green is the primary brand colour; PNG flag red, black and gold
 * are used sparingly as accents. Screens must use these tokens rather than
 * hard-coded hex values so the look stays consistent.
 */
export const colors = {
  primary: '#1F5F3F',
  primaryDark: '#164530',
  primaryLight: '#E7F1EB',

  accentRed: '#C8102E',
  accentGold: '#E8A317',
  accentGoldLight: '#FDF3DC',
  accentBlack: '#1A1A1A',

  background: '#F7F8F6',
  surface: '#FFFFFF',
  surfaceMuted: '#EFF1EE',
  border: '#DDE2DC',

  textPrimary: '#1A1F1C',
  textSecondary: '#5B6660',
  textMuted: '#8A948E',
  textOnPrimary: '#FFFFFF',

  success: '#2E7D32',
  successLight: '#E8F5E9',
  error: '#C8102E',
  errorLight: '#FDECEE',
  warning: '#B26A00',
  warningLight: '#FFF4E0',

  whatsapp: '#25D366',
  overlay: 'rgba(0, 0, 0, 0.45)',
} as const;

export type ColorName = keyof typeof colors;
