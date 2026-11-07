/**
 * Brand palette for Wantok Skills.
 * Forest green is the primary brand colour; PNG flag red, black and gold
 * are used sparingly as accents. Screens must use these tokens rather than
 * hard-coded hex values so the look stays consistent.
 */
export const colors = {
  primary: '#1F5F3F',
  primaryDark: '#164530',
  primaryLight: '#E4F0E8',

  accentRed: '#C8102E',
  accentGold: '#E8A317',
  accentGoldLight: '#FDF3DC',
  accentBlack: '#1A1A1A',

  background: '#F4F6F3',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2EE',
  border: '#E3E8E2',

  textPrimary: '#15201A',
  textSecondary: '#56625B',
  textMuted: '#8A948E',
  textOnPrimary: '#FFFFFF',
  /** Secondary text on the green header banners. */
  textOnPrimaryMuted: 'rgba(255, 255, 255, 0.78)',

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
