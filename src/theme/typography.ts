import type { TextStyle } from 'react-native';

/**
 * Plus Jakarta Sans, bundled with the app (loaded in app/_layout.tsx). Each weight is its
 * own family name, and no `fontWeight` is set: on Android that is what makes the exact
 * weight render, and it stops a phone's custom system font from replacing the app font.
 */
export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

/** Named text styles. Use these through the `AppText` component. */
export const typography = {
  display: { fontFamily: fonts.extrabold, fontSize: 28, lineHeight: 36, letterSpacing: -0.5 },
  title: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 30, letterSpacing: -0.3 },
  subtitle: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 24, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
  button: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20 },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
