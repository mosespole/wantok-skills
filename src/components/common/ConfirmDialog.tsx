import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '@/theme';

import { AppButton } from './AppButton';
import { AppText } from './AppText';

import { t } from '@/i18n';
interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for destructive actions such as deleting a listing. */
  destructive?: boolean;
  /** Keeps the dialog open with a spinner while the confirmed action runs. */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = t('common.confirm'),
  cancelLabel = t('common.cancel'),
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Ignore dismiss attempts while the action is in progress.
  const handleCancel = () => {
    if (!loading) onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={handleCancel}
        accessibilityLabel={t('a11y.closeDialog')}
      >
        {/* Inner Pressable stops taps on the dialog from closing it. */}
        <Pressable style={styles.dialog} onPress={() => undefined} accessibilityRole="alert">
          <AppText variant="subtitle">{title}</AppText>
          <AppText color="textSecondary">{message}</AppText>
          <View style={styles.actions}>
            <AppButton
              title={cancelLabel}
              variant="ghost"
              onPress={handleCancel}
              disabled={loading}
              fullWidth={false}
            />
            <AppButton
              title={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              loading={loading}
              fullWidth={false}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows.raised,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
