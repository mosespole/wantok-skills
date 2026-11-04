import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, Avatar, Card, ConfirmDialog, Screen } from '@/components/common';
import { getCategoryLabel } from '@/constants/categories';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';
import { formatPhone } from '@/utils/formatting';

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
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Avatar name={profile.fullName} imageUrl={profile.profileImageUrl} size={88} />
        <AppText variant="title" align="center">
          {profile.fullName}
        </AppText>
        <View style={styles.roleBadge}>
          <AppText variant="label" color="primary">
            {isProvider ? 'Service Provider' : 'Customer'}
          </AppText>
        </View>
      </View>

      <Card style={styles.card}>
        <InfoRow icon="mail-outline" label="Email" value={profile.email} />
        <InfoRow icon="call-outline" label="Phone" value={formatPhone(profile.phoneNumber)} />
        {isProvider && (
          <InfoRow
            icon="construct-outline"
            label="Main skill"
            value={profile.skillCategory ? getCategoryLabel(profile.skillCategory) : 'Not set'}
          />
        )}
        <InfoRow
          icon="location-outline"
          label="Location"
          value={profile.locationName || 'Not set'}
        />
      </Card>

      {logoutError && (
        <AppText color="error" align="center">
          {logoutError}
        </AppText>
      )}

      <AppButton
        title="Edit profile"
        icon="create-outline"
        variant="secondary"
        onPress={() => router.push('/edit-profile')}
      />

      <AppButton
        title="Log out"
        variant="outline"
        icon="log-out-outline"
        onPress={() => setConfirmVisible(true)}
      />

      <ConfirmDialog
        visible={confirmVisible}
        title="Log out?"
        message="You will need to log in again to use Wantok Skills."
        confirmLabel="Log out"
        destructive
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setConfirmVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  roleBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  card: { gap: spacing.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoText: { flex: 1 },
});
