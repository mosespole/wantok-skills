import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, Screen } from '@/components/common';
import { FormError } from '@/components/forms/FormError';
import { FormInput } from '@/components/forms/FormInput';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/utils/validation';

import { t } from '@/i18n';
export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setSubmitError(null);
    try {
      await resetPassword(email);
      setSentTo(email);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  if (sentTo) {
    return (
      <Screen edges={['bottom']} contentStyle={styles.centered}>
        <Ionicons name="mail-open-outline" size={56} color={colors.primary} />
        <AppText variant="title" align="center">
          {t('forgot.checkEmail')}
        </AppText>
        {/* Firebase does not reveal whether an account exists, so the wording stays neutral. */}
        <AppText color="textSecondary" align="center">
          {t('forgot.sentMessage', { email: sentTo })}
        </AppText>
        <AppButton title={t('forgot.backToLogin')} onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']}>
      <View style={styles.header}>
        <AppText variant="title">{t('forgot.title')}</AppText>
        <AppText color="textSecondary">{t('forgot.intro')}</AppText>
      </View>

      <FormError message={submitError} />

      <FormInput
        control={control}
        name="email"
        label={t('fields.email')}
        icon="mail-outline"
        placeholder={t('placeholders.email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={onSubmit}
      />

      <AppButton title={t('forgot.submit')} onPress={onSubmit} loading={isSubmitting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginBottom: spacing.sm },
  centered: { justifyContent: 'center', alignItems: 'center' },
});
