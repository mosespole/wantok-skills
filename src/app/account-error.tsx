import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, ErrorState, Screen } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { spacing } from '@/theme';

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
        message={errorMessage ?? 'We could not load your account.'}
        onRetry={handleRetry}
        retrying={retrying}
      />
      <View style={styles.footer}>
        <AppButton title="Log out" variant="ghost" icon="log-out-outline" onPress={logout} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: { paddingBottom: spacing.lg },
});
