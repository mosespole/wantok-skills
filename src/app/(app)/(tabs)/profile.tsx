import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppButton,
  AppText,
  Avatar,
  Card,
  ConfirmDialog,
  HeaderBanner,
  LanguageSwitch,
  Screen,
} from '@/components/common';
import { getCategoryLabel } from '@/constants/categories';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';
import { formatPhone } from '@/utils/formatting';

import { t } from '@/i18n';
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={colors.textMuted} />
      <View style={styles.infoText}>
        <AppText variant="caption" color="textMuted">
          {label}
        </AppText>
        <AppText>{value}</AppText>
      </View>
    </View>
  );
}

/** Account / Settings: shows the signed-in user's details and handles logout. */
export default function ProfileScreen() {
  const { profile, logout } = useAuth();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  if (!profile) return null;

  const isProvider = profile.role === 'provider';

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
    } catch (error) {
      setLogoutError(getErrorMessage(error));
      setLoggingOut(false);
      setConfirmVisible(false);
    }
  };

  return (
    <Screen edges={[]} padded={false}>
      <HeaderBanner style={styles.header}>
        <View style={styles.avatarRing}>
          <Avatar name={profile.fullName} imageUrl={profile.profileImageUrl} size={88} />
        </View>
        <AppText variant="title" color="textOnPrimary" align="center">
          {profile.fullName}
        </AppText>
        <View style={styles.roleBadge}>
          <AppText variant="label" color="primary">
            {isProvider ? t('roles.provider') : t('roles.customer')}
          </AppText>
        </View>
      </HeaderBanner>

      <View style={styles.content}>
        <Card style={styles.card}>
          <InfoRow icon="mail-outline" label={t('fields.email')} value={profile.email} />
          <InfoRow
            icon="call-outline"
            label={t('fields.phone')}
            value={formatPhone(profile.phoneNumber)}
          />
          {isProvider && (
            <InfoRow
              icon="construct-outline"
              label={t('fields.mainSkill')}
              value={
                profile.skillCategory ? getCategoryLabel(profile.skillCategory) : t('common.notSet')
              }
            />
          )}
          <InfoRow
            icon="location-outline"
            label={t('fields.location')}
            value={profile.locationName || t('common.notSet')}
          />
        </Card>

        <Card style={styles.languageCard}>
          <View style={styles.infoRow}>
            <Ionicons name="language-outline" size={20} color={colors.textMuted} />
            <View style={styles.infoText}>
              <AppText variant="bodyStrong">{t('language.label')}</AppText>
              <AppText variant="caption" color="textMuted">
                {t('language.hint')}
              </AppText>
            </View>
          </View>
          <LanguageSwitch />
        </Card>

        {logoutError && (
          <AppText color="error" align="center">
            {logoutError}
          </AppText>
        )}

        <AppButton
          title={t('screens.editProfile')}
          icon="create-outline"
          variant="secondary"
          onPress={() => router.push('/edit-profile')}
        />

        <AppButton
          title={t('auth.logout')}
          variant="outline"
          icon="log-out-outline"
          onPress={() => setConfirmVisible(true)}
        />

        <ConfirmDialog
          visible={confirmVisible}
          title={t('profile.logoutTitle')}
          message={t('profile.logoutMessage')}
          confirmLabel={t('auth.logout')}
          destructive
          loading={loggingOut}
          onConfirm={handleLogout}
          onCancel={() => setConfirmVisible(false)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.sm },
  avatarRing: {
    padding: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  roleBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  content: { padding: spacing.lg, gap: spacing.lg },
  card: { gap: spacing.lg },
  languageCard: { gap: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoText: { flex: 1 },
});
