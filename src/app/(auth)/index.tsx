import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppButton,
  AppText,
  BrandMark,
  HeaderBanner,
  LanguageSwitch,
  Screen,
} from '@/components/common';
import { APP_NAME, APP_SLOGAN_TOK_PISIN } from '@/constants/app';
import { colors, radius, spacing } from '@/theme';

import { t, type TranslationKey } from '@/i18n';
const HIGHLIGHTS: { icon: ComponentProps<typeof Ionicons>['name']; text: TranslationKey }[] = [
  { icon: 'search-outline', text: 'welcome.highlightFind' },
  { icon: 'call-outline', text: 'welcome.highlightContact' },
  { icon: 'briefcase-outline', text: 'welcome.highlightAdvertise' },
];

export default function WelcomeScreen() {
  return (
    <Screen edges={['bottom']} padded={false} contentStyle={styles.screen}>
      <HeaderBanner style={styles.hero}>
        <View style={styles.languageRow}>
          <LanguageSwitch tone="onPrimary" />
        </View>
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
          {t('app.tagline')}
        </AppText>
      </HeaderBanner>

      <View style={styles.body}>
        <View style={styles.highlights}>
          {HIGHLIGHTS.map((item) => (
            <View key={item.text} style={styles.highlightRow}>
              <View style={styles.highlightIcon}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <AppText style={styles.highlightText}>{t(item.text)}</AppText>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <AppButton title={t('auth.createAnAccount')} onPress={() => router.push('/register')} />
          <AppButton
            title={t('auth.login')}
            variant="outline"
            onPress={() => router.push('/login')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'space-between' },
  hero: { alignItems: 'center', paddingBottom: spacing.xxl, gap: spacing.sm },
  languageRow: { alignSelf: 'stretch', alignItems: 'flex-end', marginBottom: spacing.sm },
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
