import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ensureOnline } from '@/services/network/networkService';
import {
  deleteReview,
  getMyReview,
  getProviderReviews,
  getRatingSummary,
  saveReview,
} from '@/services/firebase/reviewService';

import { useAuth } from './useAuth';

const reviewKeys = {
  all: ['reviews'] as const,
  list: (providerId: string) => [...reviewKeys.all, 'list', providerId] as const,
  summary: (providerId: string) => [...reviewKeys.all, 'summary', providerId] as const,
  mine: (uid: string, providerId: string) => [...reviewKeys.all, 'mine', uid, providerId] as const,
};

export function useProviderReviews(providerId: string) {
  return useQuery({
    queryKey: reviewKeys.list(providerId),
    queryFn: () => getProviderReviews(providerId),
    enabled: providerId !== '',
  });
}

export function useRatingSummary(providerId: string) {
  return useQuery({
    queryKey: reviewKeys.summary(providerId),
    queryFn: () => getRatingSummary(providerId),
    enabled: providerId !== '',
  });
}

/** The signed-in customer's own review of a provider (customers only). */
export function useMyReview(providerId: string) {
  const { user, profile } = useAuth();
  const uid = user?.uid ?? '';
  return useQuery({
    queryKey: reviewKeys.mine(uid, providerId),
    queryFn: () => getMyReview(uid, providerId),
    enabled: uid !== '' && providerId !== '' && profile?.role === 'customer',
  });
}

export function useSaveReview(providerId: string) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      rating,
      comment,
      isUpdate,
    }: {
      rating: number;
      comment: string;
      isUpdate: boolean;
    }) => {
      if (!user || !profile) throw new Error('errors.loginToReview');
      await ensureOnline();
      await saveReview(
        { customerId: user.uid, customerName: profile.fullName, providerId, rating, comment },
        isUpdate,
      );
    },
    // Ratings appear on provider pages and listing cards, so refresh all of them.
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

export function useDeleteReview(providerId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('errors.loginRequired');
      await ensureOnline();
      await deleteReview(user.uid, providerId);
    },
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
