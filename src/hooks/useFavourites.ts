import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  addFavourite,
  getFavouriteProviders,
  getFavourites,
  removeFavourite,
} from '@/services/firebase/favouriteService';
import { ensureOnline } from '@/services/network/networkService';
import type { Favourite } from '@/types/favourite';

import { useAuth } from './useAuth';

const favouriteKeys = {
  all: ['favourites'] as const,
  ids: (uid: string) => [...favouriteKeys.all, 'ids', uid] as const,
  providers: (uid: string) => [...favouriteKeys.all, 'providers', uid] as const,
};

/** The signed-in user's favourites, plus a toggle that updates the UI instantly. */
export function useFavourites() {
  const { user } = useAuth();
  const uid = user?.uid ?? '';
  const queryClient = useQueryClient();

  const favouritesQuery = useQuery({
    queryKey: favouriteKeys.ids(uid),
    queryFn: () => getFavourites(uid),
    enabled: uid !== '',
  });

  const favouriteIds = useMemo(
    () => new Set((favouritesQuery.data ?? []).map((favourite) => favourite.providerId)),
    [favouritesQuery.data],
  );

  const toggleMutation = useMutation({
    mutationFn: async ({ providerId, save }: { providerId: string; save: boolean }) => {
      await ensureOnline();
      return save ? addFavourite(uid, providerId) : removeFavourite(uid, providerId);
    },

    // Optimistic update: flip the heart immediately, roll back if Firestore rejects it.
    onMutate: async ({ providerId, save }) => {
      const key = favouriteKeys.ids(uid);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Favourite[]>(key);
      queryClient.setQueryData<Favourite[]>(key, (current = []) =>
        save
          ? [
              ...current,
              {
                favouriteId: `${uid}_${providerId}`,
                customerId: uid,
                providerId,
                createdAt: new Date(),
              },
            ]
          : current.filter((favourite) => favourite.providerId !== providerId),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(favouriteKeys.ids(uid), context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: favouriteKeys.all }),
  });

  return {
    favouriteIds,
    isLoading: favouritesQuery.isLoading,
    isFavourite: (providerId: string) => favouriteIds.has(providerId),
    toggleFavourite: (providerId: string) =>
      toggleMutation.mutateAsync({ providerId, save: !favouriteIds.has(providerId) }),
    isToggling: toggleMutation.isPending,
  };
}

/** Full provider details for the Favourites screen. */
export function useFavouriteProviders() {
  const { user } = useAuth();
  const uid = user?.uid ?? '';
  return useQuery({
    queryKey: favouriteKeys.providers(uid),
    queryFn: () => getFavouriteProviders(uid),
    enabled: uid !== '',
  });
}
