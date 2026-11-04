import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addPortfolioItem,
  deletePortfolioItem,
  getPortfolio,
  getPortfolioItem,
  updatePortfolioItem,
} from '@/services/firebase/portfolioService';
import { ensureOnline } from '@/services/network/networkService';
import type { PortfolioInput } from '@/types/portfolio';

import { useAuth } from './useAuth';

const portfolioKeys = {
  all: ['portfolio'] as const,
  byProvider: (providerId: string) => [...portfolioKeys.all, 'provider', providerId] as const,
  item: (itemId: string) => [...portfolioKeys.all, 'item', itemId] as const,
};

/** A provider's past-work gallery. */
export function usePortfolio(providerId: string) {
  return useQuery({
    queryKey: portfolioKeys.byProvider(providerId),
    queryFn: () => getPortfolio(providerId),
    enabled: providerId !== '',
  });
}

export function usePortfolioItem(itemId: string) {
  return useQuery({
    queryKey: portfolioKeys.item(itemId),
    queryFn: () => getPortfolioItem(itemId),
    enabled: itemId !== '',
  });
}

export function useAddPortfolioItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PortfolioInput) => {
      if (!user) throw new Error('You must be logged in to add past work.');
      await ensureOnline();
      return addPortfolioItem(user.uid, input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: portfolioKeys.all }),
  });
}

export function useUpdatePortfolioItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, input }: { itemId: string; input: PortfolioInput }) => {
      await ensureOnline();
      return updatePortfolioItem(itemId, input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: portfolioKeys.all }),
  });
}

export function useDeletePortfolioItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      await ensureOnline();
      return deletePortfolioItem(itemId);
    },
    onSuccess: (_result, itemId) => {
      queryClient.removeQueries({ queryKey: portfolioKeys.item(itemId) });
      return queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
    },
  });
}
