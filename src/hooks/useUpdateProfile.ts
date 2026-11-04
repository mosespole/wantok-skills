import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateUserProfile, type EditableProfileFields } from '@/services/firebase/userService';

import { useAuth } from './useAuth';

/** Saves profile changes, then refreshes the profile held in AuthContext and cached lists. */
export function useUpdateProfile() {
  const { user, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: EditableProfileFields) => {
      if (!user) throw new Error('You must be logged in to update your profile.');
      await updateUserProfile(user.uid, updates);
    },
    onSuccess: async () => {
      await refreshProfile().catch(() => undefined);
      // Listings and favourites show provider names/photos, so refresh those too.
      await queryClient.invalidateQueries();
    },
  });
}
