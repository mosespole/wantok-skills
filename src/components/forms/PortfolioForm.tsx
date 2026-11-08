import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Controller, useForm, type DefaultValues } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/components/common';
import { compressPhoto } from '@/services/media/imageCompression';
import { pickImage } from '@/services/media/imagePickerService';
import { colors, radius, spacing } from '@/theme';
import type { PortfolioInput } from '@/types/portfolio';
import { getErrorMessage } from '@/utils/errors';
import { portfolioSchema, type PortfolioFormValues } from '@/utils/validation';

import { CategoryPicker } from './CategoryPicker';
import { DateField } from './DateField';
import { FormError } from './FormError';
import { FormInput } from './FormInput';

import { t } from '@/i18n';
interface PortfolioFormProps {
  defaultValues: DefaultValues<PortfolioFormValues>;
  /** Existing photo when editing. */
  initialImageData?: string;
  submitLabel: string;
  onSubmit: (input: PortfolioInput) => Promise<void>;
}

/** Add/Edit a past-work project: photo, caption, category, optional location and date. */
export function PortfolioForm({
  defaultValues,
  initialImageData,
  submitLabel,
  onSubmit,
}: PortfolioFormProps) {
  const [imageData, setImageData] = useState<string | null>(initialImageData ?? null);
  const [processing, setProcessing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
    defaultValues,
  });

  const choosePhoto = async () => {
    setPhotoError(null);
    try {
      const picked = await pickImage({ aspect: [4, 3] });
      if (!picked) return;
      setProcessing(true);
      setImageData(await compressPhoto(picked.uri, 'portfolio'));
    } catch (error) {
      setPhotoError(getErrorMessage(error));
    } finally {
      setProcessing(false);
    }
  };

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    if (!imageData) {
      setPhotoError(t('portfolio.photoRequired'));
      return;
    }
    try {
      await onSubmit({ ...values, imageData });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  return (
    <View style={styles.form}>
      <FormError message={submitError} />

      <View style={styles.photoBlock}>
        <AppText variant="label" color="textSecondary">
          {t('portfolio.photoLabel')}
        </AppText>
        {imageData ? (
          <Pressable
            onPress={choosePhoto}
            accessibilityRole="button"
            accessibilityLabel={t('portfolio.changePhoto')}
          >
            <Image source={{ uri: imageData }} style={styles.photo} contentFit="cover" />
          </Pressable>
        ) : (
          <Pressable
            onPress={choosePhoto}
            style={styles.photoEmpty}
            accessibilityRole="button"
            accessibilityLabel={t('portfolio.addPhoto')}
          >
            <Ionicons name="camera-outline" size={32} color={colors.primary} />
            <AppText variant="label" color="primary">
              {t('portfolio.addPhoto')}
            </AppText>
          </Pressable>
        )}
        {processing && (
          <AppText variant="caption" color="textSecondary">
            {t('portfolio.preparing')}
          </AppText>
        )}
        {imageData && !processing && (
          <Pressable onPress={choosePhoto} accessibilityRole="button">
            <AppText variant="label" color="primary">
              {t('common.chooseDifferentPhoto')}
            </AppText>
          </Pressable>
        )}
        {photoError && (
          <AppText variant="caption" color="error">
            {photoError}
          </AppText>
        )}
      </View>

      <FormInput
        control={control}
        name="caption"
        label={t('portfolio.caption')}
        placeholder={t('portfolio.captionPlaceholder')}
        maxLength={120}
      />

      <Controller
        control={control}
        name="category"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <CategoryPicker
            label={t('portfolio.category')}
            value={value}
            onChange={onChange}
            error={error?.message}
          />
        )}
      />

      <FormInput
        control={control}
        name="locationName"
        label={t('fields.location')}
        icon="location-outline"
        placeholder={t('portfolio.locationPlaceholder')}
        optional
        maxLength={100}
      />

      <Controller
        control={control}
        name="completedAt"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <DateField
            label={t('portfolio.dateCompleted')}
            value={value}
            onChange={onChange}
            maximumDate={new Date()}
            error={error?.message}
          />
        )}
      />

      <AppButton
        title={submitLabel}
        onPress={submit}
        loading={isSubmitting}
        disabled={processing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  photoBlock: { gap: spacing.sm },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.md },
  photoEmpty: {
    aspectRatio: 4 / 3,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
});
