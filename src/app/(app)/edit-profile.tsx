import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { StyleSheet } from 'react-native';

import { AppButton, AppText, Screen } from '@/components/common';
import { CategoryPicker } from '@/components/forms/CategoryPicker';
import { FormError } from '@/components/forms/FormError';
import { FormInput } from '@/components/forms/FormInput';
import { LocationField } from '@/components/forms/LocationField';
import { ProfilePhotoEditor } from '@/components/forms/ProfilePhotoEditor';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';
import { toLocalPhoneDigits } from '@/utils/formatting';
import { profileSchema, type ProfileFormValues } from '@/utils/validation';

export default function EditProfileScreen() {
  const { profile } = useAuth();
  const updateProfile = useUpdateProfile();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isProvider = profile?.role === 'provider';

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.fullName ?? '',
      phoneNumber: profile?.phoneNumber ?? '',
      bio: profile?.bio ?? '',
      skillCategory: (profile?.skillCategory ?? '') as ProfileFormValues['skillCategory'],
      locationName: profile?.locationName ?? '',
      latitude: profile?.latitude ?? null,
      longitude: profile?.longitude ?? null,
    },
  });

  const [latitude, longitude] = useWatch({ control, name: ['latitude', 'longitude'] });
  const coords =
    typeof latitude === 'number' && typeof longitude === 'number' ? { latitude, longitude } : null;

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await updateProfile.mutateAsync({
        fullName: values.fullName.trim(),
        phoneNumber: toLocalPhoneDigits(values.phoneNumber),
        bio: values.bio.trim(),
        skillCategory: values.skillCategory,
        locationName: values.locationName.trim(),
        latitude: values.latitude,
        longitude: values.longitude,
      });
      router.back();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  if (!profile) return null;

  return (
    <Screen edges={['bottom']}>
      {/* The photo uploads and saves on its own, separately from the form below. */}
      <ProfilePhotoEditor name={profile.fullName} currentUrl={profile.profileImageUrl} />

      <FormError message={submitError} />

      <FormInput
        control={control}
        name="fullName"
        label="Full name"
        icon="person-outline"
        autoCapitalize="words"
        maxLength={60}
      />
      <FormInput
        control={control}
        name="phoneNumber"
        label="Phone number"
        icon="call-outline"
        keyboardType="phone-pad"
        maxLength={16}
      />

      {isProvider && (
        <>
          <Controller
            control={control}
            name="skillCategory"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <CategoryPicker
                label="Main skill"
                value={value === '' ? undefined : value}
                onChange={onChange}
                error={error?.message}
              />
            )}
          />
          <FormInput
            control={control}
            name="bio"
            label="About you"
            placeholder="Your experience, qualifications and the areas you cover"
            multiline
            optional
            maxLength={500}
          />
        </>
      )}

      <FormInput
        control={control}
        name="locationName"
        label="Location"
        icon="location-outline"
        placeholder="e.g. Eriku, Lae"
        optional
        maxLength={100}
      />

      {isProvider && (
        <LocationField
          coords={coords}
          onLocated={(position, placeName) => {
            setValue('latitude', position.latitude, { shouldDirty: true });
            setValue('longitude', position.longitude, { shouldDirty: true });
            if (placeName && getValues('locationName').trim() === '') {
              setValue('locationName', placeName, { shouldValidate: true });
            }
          }}
          onClear={() => {
            setValue('latitude', null, { shouldDirty: true });
            setValue('longitude', null, { shouldDirty: true });
          }}
        />
      )}

      <AppText variant="caption" color="textMuted" style={styles.note}>
        Your email ({profile.email}) and account type cannot be changed.
      </AppText>

      <AppButton title="Save profile" onPress={onSubmit} loading={isSubmitting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { marginTop: spacing.xs },
});
