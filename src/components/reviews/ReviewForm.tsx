import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppInput, AppText, Card, ConfirmDialog } from '@/components/common';
import { useDeleteReview, useSaveReview } from '@/hooks/useReviews';
import { spacing } from '@/theme';
import type { Review } from '@/types/review';
import { getErrorMessage } from '@/utils/errors';
import { reviewSchema } from '@/utils/validation';

import { StarInput } from './StarRating';

import { t, tMessage } from '@/i18n';
interface ReviewFormProps {
  providerId: string;
  providerName: string;
  /** The customer's existing review, when editing. */
  existing: Review | null;
}

/** Lets a customer write, edit or delete their single review of a provider. */
export function ReviewForm({ providerId, providerName, existing }: ReviewFormProps) {
  const saveReview = useSaveReview(providerId);
  const deleteReview = useDeleteReview(providerId);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const submit = async () => {
    setError(null);
    setSaved(false);
    const parsed = reviewSchema.safeParse({ rating, comment });
    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message;
      setError(issue ? tMessage(issue) : t('reviews.checkReview'));
      return;
    }
    try {
      await saveReview.mutateAsync({ ...parsed.data, isUpdate: existing !== null });
      setSaved(true);
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    }
  };

  const remove = async () => {
    setError(null);
    try {
      await deleteReview.mutateAsync();
      setRating(0);
      setComment('');
      setSaved(false);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setConfirmDelete(false);
    }
  };

  return (
    <Card style={styles.card}>
      <AppText variant="bodyStrong">
        {existing ? t('reviews.yours') : t('reviews.rate', { name: providerName })}
      </AppText>
      <StarInput
        value={rating}
        onChange={(stars) => {
          setRating(stars);
          setSaved(false);
        }}
      />
      <AppInput
        label={t('reviews.comment')}
        optional
        value={comment}
        onChangeText={(text) => {
          setComment(text);
          setSaved(false);
        }}
        placeholder={t('reviews.commentPlaceholder')}
        multiline
        maxLength={500}
      />
      {error && (
        <AppText variant="caption" color="error">
          {error}
        </AppText>
      )}
      {saved && (
        <AppText variant="caption" color="success">
          {t('reviews.saved')}
        </AppText>
      )}
      <View style={styles.actions}>
        {existing && (
          <AppButton
            title={t('common.delete')}
            variant="ghost"
            onPress={() => setConfirmDelete(true)}
            fullWidth={false}
          />
        )}
        <AppButton
          title={existing ? t('reviews.update') : t('reviews.post')}
          onPress={submit}
          loading={saveReview.isPending}
          fullWidth={false}
        />
      </View>

      <ConfirmDialog
        visible={confirmDelete}
        title={t('reviews.deleteTitle')}
        message={t('reviews.deleteMessage')}
        confirmLabel={t('common.delete')}
        destructive
        loading={deleteReview.isPending}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
});
