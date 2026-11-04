import { StyleSheet, View } from 'react-native';

import { AppText, Card, ErrorState, LoadingState, SectionHeader } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { useMyReview, useProviderReviews, useRatingSummary } from '@/hooks/useReviews';
import { spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';
import { formatRelativeDate } from '@/utils/formatting';

import { ReviewForm } from './ReviewForm';
import { StarRating } from './StarRating';

interface ReviewsSectionProps {
  providerId: string;
  providerName: string;
}

/** Rating summary, the customer's own review form, and all reviews for a provider. */
export function ReviewsSection({ providerId, providerName }: ReviewsSectionProps) {
  const { user, profile } = useAuth();
  const summaryQuery = useRatingSummary(providerId);
  const reviewsQuery = useProviderReviews(providerId);
  const myReviewQuery = useMyReview(providerId);

  // Only customers can review, and never themselves (also enforced by the security rules).
  const canReview = profile?.role === 'customer' && user?.uid !== providerId;
  const summary = summaryQuery.data;
  const otherReviews = (reviewsQuery.data ?? []).filter(
    (review) => review.customerId !== user?.uid,
  );

  return (
    <View style={styles.section}>
      <SectionHeader title="Reviews" />

      {summary && summary.count > 0 && summary.average !== null ? (
        <View style={styles.summary}>
          <AppText variant="display">{summary.average.toFixed(1)}</AppText>
          <View style={styles.summaryText}>
            <StarRating value={summary.average} size={20} />
            <AppText variant="caption" color="textSecondary">
              Based on {summary.count} {summary.count === 1 ? 'review' : 'reviews'}
            </AppText>
          </View>
        </View>
      ) : (
        summaryQuery.isSuccess && (
          <AppText color="textSecondary">
            No reviews yet. Be the first to share your experience.
          </AppText>
        )
      )}

      {canReview &&
        (myReviewQuery.isLoading ? (
          <LoadingState message="Loading your review..." />
        ) : (
          // key resets the form when the review is created or deleted.
          <ReviewForm
            key={myReviewQuery.data?.reviewId ?? 'new'}
            providerId={providerId}
            providerName={providerName}
            existing={myReviewQuery.data ?? null}
          />
        ))}

      {reviewsQuery.isLoading ? (
        <LoadingState message="Loading reviews..." />
      ) : reviewsQuery.isError ? (
        <ErrorState
          message={getErrorMessage(reviewsQuery.error)}
          onRetry={() => reviewsQuery.refetch()}
          retrying={reviewsQuery.isFetching}
        />
      ) : (
        otherReviews.map((review) => (
          <Card key={review.reviewId} style={styles.review}>
            <View style={styles.reviewHeader}>
              <AppText variant="bodyStrong" style={styles.flex} numberOfLines={1}>
                {review.customerName}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {formatRelativeDate(review.updatedAt)}
              </AppText>
            </View>
            <StarRating value={review.rating} />
            {review.comment !== '' && <AppText color="textSecondary">{review.comment}</AppText>}
          </Card>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  section: { gap: spacing.md },
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  summaryText: { gap: spacing.xxs },
  review: { gap: spacing.xs },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
