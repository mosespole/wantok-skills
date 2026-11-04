/**
 * A document in the `reviews` collection. The document ID is
 * "{customerId}_{providerId}", so each customer can review a provider once.
 */
export interface Review {
  reviewId: string;
  customerId: string;
  providerId: string;
  /**
   * Copied from the customer's profile when the review is saved, because customer
   * profiles are private and cannot be read by other users. Rules check it matches.
   */
  customerName: string;
  /** Whole stars, 1 to 5. */
  rating: number;
  /** Optional written feedback (may be empty). */
  comment: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

/** Average stars and number of reviews for one provider, calculated by Firestore. */
export interface RatingSummary {
  /** Null when the provider has no reviews yet. */
  average: number | null;
  count: number;
}
