import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';

import type { RatingSummary, Review } from '@/types/review';

import { db } from './firebaseConfig';

const REVIEWS = 'reviews';
const reviewsCollection = collection(db, REVIEWS);

/** One review per customer per provider; the security rules check this ID format. */
function reviewId(customerId: string, providerId: string): string {
  return `${customerId}_${providerId}`;
}

function toDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

function mapReview(id: string, data: DocumentData): Review {
  return {
    reviewId: id,
    customerId: data.customerId ?? '',
    providerId: data.providerId ?? '',
    customerName: data.customerName ?? 'Customer',
    rating: typeof data.rating === 'number' ? data.rating : 0,
    comment: data.comment ?? '',
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

/** All reviews for a provider, newest first. */
export async function getProviderReviews(providerId: string): Promise<Review[]> {
  const snapshot = await getDocs(query(reviewsCollection, where('providerId', '==', providerId)));
  return snapshot.docs
    .map((d) => mapReview(d.id, d.data()))
    .sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
}

/** Average stars and review count, worked out from a list of reviews. */
export function summariseRatings(reviews: Pick<Review, 'rating'>[]): RatingSummary {
  if (reviews.length === 0) return { average: null, count: 0 };
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return { average: total / reviews.length, count: reviews.length };
}

/**
 * Average rating and review count for a provider. Calculated in the app from the
 * provider's reviews: Firestore's server-side average() with a providerId filter
 * would need an extra composite index, and providers have few reviews.
 */
export async function getRatingSummary(providerId: string): Promise<RatingSummary> {
  return summariseRatings(await getProviderReviews(providerId));
}

/** The signed-in customer's review of this provider, if they have written one. */
export async function getMyReview(customerId: string, providerId: string): Promise<Review | null> {
  const snapshot = await getDoc(doc(db, REVIEWS, reviewId(customerId, providerId)));
  return snapshot.exists() ? mapReview(snapshot.id, snapshot.data()) : null;
}

export interface ReviewInput {
  customerId: string;
  customerName: string;
  providerId: string;
  rating: number;
  comment: string;
}

/** Creates the review, or updates it if this customer already reviewed this provider. */
export async function saveReview(input: ReviewInput, isUpdate: boolean) {
  const reference = doc(db, REVIEWS, reviewId(input.customerId, input.providerId));
  const fields = { rating: input.rating, comment: input.comment.trim() };
  if (isUpdate) {
    await updateDoc(reference, { ...fields, updatedAt: serverTimestamp() });
    return;
  }
  await setDoc(reference, {
    ...fields,
    customerId: input.customerId,
    customerName: input.customerName,
    providerId: input.providerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteReview(customerId: string, providerId: string) {
  await deleteDoc(doc(db, REVIEWS, reviewId(customerId, providerId)));
}
