import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, BrandMark, Screen } from '@/components/common';
import { APP_NAME, APP_TAGLINE } from '@/constants/app';
import { colors, radius, spacing } from '@/theme';

const HIGHLIGHTS: { icon: ComponentProps<typeof Ionicons>['name']; text: string }[] = [
  { icon: 'search-outline', text: 'Find trusted local tradespeople and freelancers' },
  { icon: 'call-outline', text: 'Contact providers directly by phone or WhatsApp' },
  { icon: 'briefcase-outline', text: 'Advertise your own skills to the community' },
];

export default function WelcomeScreen() {
  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.hero}>
        <BrandMark size={88} />
        <AppText variant="display" align="center">
          {APP_NAME}
        </AppText>
        <AppText variant="bodyStrong" color="textSecondary" align="center">
          {APP_TAGLINE}
        </AppText>
      </View>

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
        <AppButton title="Login" variant="outline" onPress={() => router.push('/login')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: spacing.xxl },
  hero: { alignItems: 'center', gap: spacing.md },
  highlights: { gap: spacing.md },
  highlightRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
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
