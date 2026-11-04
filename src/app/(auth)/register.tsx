import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, Screen } from '@/components/common';
import { FormError } from '@/components/forms/FormError';
import { FormInput } from '@/components/forms/FormInput';
import { RoleSelector } from '@/components/forms/RoleSelector';
import { useAuth } from '@/hooks/useAuth';
import { spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';
import { registerSchema, type RegisterFormValues } from '@/utils/validation';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  // On success the auth guard swaps to the app automatically; no manual navigation needed.
  const onSubmit = handleSubmit(async ({ confirmPassword: _confirm, ...values }) => {
    setSubmitError(null);
    try {
      await register(values);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  return (
    <Screen edges={['bottom']}>
      <View style={styles.header}>
        <AppText variant="title">Create your account</AppText>
        <AppText color="textSecondary">
          Join your wantoks to find help or offer your skills.
        </AppText>
      </View>

      <FormError message={submitError} />

      <Controller
        control={control}
        name="role"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <RoleSelector value={value} onChange={onChange} error={error?.message} />
        )}
      />

      <FormInput
        control={control}
        name="fullName"
        label="Full name"
        icon="person-outline"
        placeholder="e.g. Kila Wari"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        maxLength={60}
      />
      <FormInput
        control={control}
        name="email"
        label="Email"
        icon="mail-outline"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <FormInput
        control={control}
        name="phoneNumber"
        label="Phone number"
        icon="call-outline"
        placeholder="7123 4567"
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        maxLength={16}
      />
      <FormInput
        control={control}
        name="password"
        label="Password"
        icon="lock-closed-outline"
        placeholder="At least 8 characters, with a number"
        secureToggle
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <FormInput
        control={control}
        name="confirmPassword"
        label="Confirm password"
        icon="lock-closed-outline"
        placeholder="Re-enter your password"
        secureToggle
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={onSubmit}
      />

      <AppButton title="Create account" onPress={onSubmit} loading={isSubmitting} />

      <View style={styles.footer}>
        <AppText color="textSecondary">Already have an account?</AppText>
        <Link href="/login" replace>
          <AppText variant="bodyStrong" color="primary">
            Log in
          </AppText>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginBottom: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, flexWrap: 'wrap' },
});
