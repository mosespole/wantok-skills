import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, ErrorState, Screen } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { spacing } from '@/theme';

import { t, tMessage } from '@/i18n';
/** Shown when the user is signed in but their profile could not be loaded (e.g. offline). */
export default function AccountErrorScreen() {
  const { errorMessage, refreshProfile, logout } = useAuth();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await refreshProfile();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <Screen scroll={false}>
      <ErrorState
        message={errorMessage ? tMessage(errorMessage) : t('accountError.default')}
        onRetry={handleRetry}
        retrying={retrying}
      />
      <View style={styles.footer}>
        <AppButton
          title={t('auth.logout')}
          variant="ghost"
          icon="log-out-outline"
          // A failed logout leaves the user on this screen; swallow it instead of crashing.
          onPress={() => void logout().catch(() => undefined)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: { paddingBottom: spacing.lg },
});
