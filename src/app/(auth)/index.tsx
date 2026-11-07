import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, BrandMark, HeaderBanner, Screen } from '@/components/common';
import { APP_NAME, APP_SLOGAN_TOK_PISIN, APP_TAGLINE } from '@/constants/app';
import { colors, radius, spacing } from '@/theme';

const HIGHLIGHTS: { icon: ComponentProps<typeof Ionicons>['name']; text: string }[] = [
  { icon: 'search-outline', text: 'Find trusted local tradespeople and freelancers' },
  { icon: 'call-outline', text: 'Contact providers directly by phone or WhatsApp' },
  { icon: 'briefcase-outline', text: 'Advertise your own skills to the community' },
];

export default function WelcomeScreen() {
  return (
    <Screen edges={['bottom']} padded={false} contentStyle={styles.screen}>
      <HeaderBanner style={styles.hero}>
        <View style={styles.markRing}>
          <BrandMark size={84} inverted />
        </View>
        <AppText variant="display" color="textOnPrimary" align="center">
          {APP_NAME}
        </AppText>
        <AppText variant="subtitle" color="textOnPrimary" align="center">
          {APP_SLOGAN_TOK_PISIN}
        </AppText>
        <AppText variant="caption" color="textOnPrimaryMuted" align="center">
          {APP_TAGLINE}
        </AppText>
      </HeaderBanner>

      <View style={styles.body}>
        <View style={styles.highlights}>
          {HIGHLIGHTS.map((item) => (
            <View key={item.text} style={styles.highlightRow}>
              <View style={styles.highlightIcon}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <AppText style={styles.highlightText}>{item.text}</AppText>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <AppButton title="Create an account" onPress={() => router.push('/register')} />
          <AppButton title="Log in" variant="outline" onPress={() => router.push('/login')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'space-between' },
  hero: { alignItems: 'center', paddingBottom: spacing.xxl, gap: spacing.sm },
  markRing: {
    padding: 6,
    marginBottom: spacing.sm,
    borderRadius: radius.xl + 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  body: { flex: 1, justifyContent: 'space-between', padding: spacing.lg, gap: spacing.xxl },
  highlights: { gap: spacing.md, marginTop: spacing.md },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightText: { flex: 1 },
  actions: { gap: spacing.md },
});
