import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, Screen } from '@/components/common';
import { FormError } from '@/components/forms/FormError';
import { FormInput } from '@/components/forms/FormInput';
import { useAuth } from '@/hooks/useAuth';
import { spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';
import { loginSchema, type LoginFormValues } from '@/utils/validation';

import { t } from '@/i18n';
export default function LoginScreen() {
  const { login, status } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setSubmitError(null);
    try {
      await login(email, password);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  // After Firebase accepts the password the profile still has to load,
  // so keep the button busy until navigation switches to the app.
  const busy = isSubmitting || status === 'loading';

  return (
    <Screen edges={['bottom']}>
      <View style={styles.header}>
        <AppText variant="title">{t('login.title')}</AppText>
        <AppText color="textSecondary">{t('login.intro')}</AppText>
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
        returnKeyType="next"
      />
      <FormInput
        control={control}
        name="password"
        label={t('fields.password')}
        icon="lock-closed-outline"
        placeholder={t('login.passwordPlaceholder')}
        secureToggle
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={onSubmit}
      />

      <Link href="/forgot-password" style={styles.forgot}>
        <AppText variant="label" color="primary">
          {t('login.forgot')}
        </AppText>
      </Link>

      <AppButton title={t('auth.login')} onPress={onSubmit} loading={busy} />

      <View style={styles.footer}>
        <AppText color="textSecondary">{t('login.newHere')}</AppText>
        <Link href="/register" replace>
          <AppText variant="bodyStrong" color="primary">
            {t('auth.createAnAccount')}
          </AppText>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginBottom: spacing.sm },
  forgot: { alignSelf: 'flex-end' },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, flexWrap: 'wrap' },
});
