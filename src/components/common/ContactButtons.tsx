import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';
import { callPhone, openWhatsApp } from '@/utils/contact';
import { getErrorMessage } from '@/utils/errors';

import { AppButton } from './AppButton';
import { AppText } from './AppText';

interface ContactButtonsProps {
  phone: string;
  /** Pre-filled WhatsApp message, e.g. mentioning the listing title. */
  whatsAppMessage?: string;
}

/** Call and WhatsApp actions for a provider's number. */
export function ContactButtons({ phone, whatsAppMessage }: ContactButtonsProps) {
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<void>) => {
    setError(null);
    try {
      await action();
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <AppButton
          title="Call"
          icon="call"
          onPress={() => run(() => callPhone(phone))}
          style={styles.button}
          fullWidth={false}
        />
        <AppButton
          title="WhatsApp"
          icon="logo-whatsapp"
          variant="whatsapp"
          onPress={() => run(() => openWhatsApp(phone, whatsAppMessage))}
          style={styles.button}
          fullWidth={false}
        />
      </View>
      {error && (
        <AppText variant="caption" color="error" align="center">
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
  button: { flex: 1, paddingHorizontal: spacing.md },
});
