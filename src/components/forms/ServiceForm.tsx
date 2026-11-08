import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm, useWatch, type DefaultValues } from 'react-hook-form';
import { StyleSheet, Switch, View } from 'react-native';

import { AppButton, AppText } from '@/components/common';
import { colors, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';
import { serviceSchema, type ServiceFormValues } from '@/utils/validation';

import { CategoryPicker } from './CategoryPicker';
import { FormError } from './FormError';
import { FormInput } from './FormInput';
import { LocationField } from './LocationField';
import { ServiceImageField, type ImageChange } from './ServiceImageField';

import { t } from '@/i18n';
interface ServiceFormProps {
  defaultValues: DefaultValues<ServiceFormValues>;
  submitLabel: string;
  /** Show the "visible to customers" switch (edit screen only). */
  showActiveToggle?: boolean;
  /** Photo already saved on the listing (edit screen). */
  currentImageUrl?: string | null;
  /** 0–1 while the photo uploads during save, otherwise null. */
  uploadProgress?: number | null;
  onSubmit: (values: ServiceFormValues, imageChange: ImageChange) => Promise<void>;
}

/** Shared by Create Listing and Edit Listing so both validate identically. */
export function ServiceForm({
  defaultValues,
  submitLabel,
  showActiveToggle = false,
  currentImageUrl = null,
  uploadProgress = null,
  onSubmit,
}: ServiceFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageChange, setImageChange] = useState<ImageChange>({ type: 'keep' });

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues,
  });

  // useWatch (not watch) so the React Compiler re-renders when the position changes.
  const [latitude, longitude] = useWatch({ control, name: ['latitude', 'longitude'] });
  const coords =
    typeof latitude === 'number' && typeof longitude === 'number' ? { latitude, longitude } : null;

  // isSubmitting stays true until onSubmit resolves, which disables the button
  // and prevents duplicate listings from rapid taps.
  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await onSubmit(values, imageChange);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  return (
    <View style={styles.form}>
      <FormError message={submitError} />

      <FormInput
        control={control}
        name="title"
        label={t('serviceForm.title')}
        placeholder={t('serviceForm.titlePlaceholder')}
        maxLength={80}
      />

      <Controller
        control={control}
        name="category"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <CategoryPicker
            label={t('serviceForm.category')}
            value={value}
            onChange={onChange}
            error={error?.message}
          />
        )}
      />

      <ServiceImageField
        currentUrl={currentImageUrl}
        change={imageChange}
        onChange={setImageChange}
        uploadProgress={uploadProgress}
      />

      <FormInput
        control={control}
        name="description"
        label={t('serviceForm.description')}
        placeholder={t('serviceForm.descriptionPlaceholder')}
        multiline
        maxLength={1000}
      />

      <FormInput
        control={control}
        name="locationName"
        label={t('fields.location')}
        icon="location-outline"
        placeholder={t('placeholders.location')}
        maxLength={100}
      />

      <LocationField
        coords={coords}
        onLocated={(position, placeName) => {
          setValue('latitude', position.latitude, { shouldDirty: true });
          setValue('longitude', position.longitude, { shouldDirty: true });
          // Fill the location text only if the provider has not typed one.
          if (placeName && getValues('locationName').trim() === '') {
            setValue('locationName', placeName, { shouldValidate: true });
          }
        }}
        onClear={() => {
          setValue('latitude', null, { shouldDirty: true });
          setValue('longitude', null, { shouldDirty: true });
        }}
      />

      <FormInput
        control={control}
        name="contactNumber"
        label={t('serviceForm.contactNumber')}
        icon="call-outline"
        placeholder="7123 4567"
        keyboardType="phone-pad"
        maxLength={16}
      />

      <FormInput
        control={control}
        name="startingPrice"
        label={t('serviceForm.price')}
        icon="pricetag-outline"
        placeholder={t('serviceForm.pricePlaceholder')}
        keyboardType="decimal-pad"
        optional
        maxLength={10}
      />

      {showActiveToggle && (
        <Controller
          control={control}
          name="isActive"
          render={({ field: { value, onChange } }) => (
            <View style={styles.switchRow}>
              <View style={styles.switchText}>
                <AppText variant="bodyStrong">{t('serviceForm.visible')}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {t('serviceForm.visibleHint')}
                </AppText>
              </View>
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor={colors.surface}
                accessibilityLabel={t('serviceForm.visible')}
              />
            </View>
          )}
        />
      )}

      <AppButton title={submitLabel} onPress={submit} loading={isSubmitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  switchText: { flex: 1, gap: spacing.xxs },
});
