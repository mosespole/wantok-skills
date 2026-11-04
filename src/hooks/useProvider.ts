import { useQuery } from '@tanstack/react-query';

import { getAllProviders, getProviderSummary } from '@/services/firebase/userService';

export function useProvider(providerId: string) {
  return useQuery({
    queryKey: ['providers', providerId],
    queryFn: () => getProviderSummary(providerId),
    enabled: providerId !== '',
  });
}

/** All providers, for the Search screen. Only fetched while `enabled` (i.e. the user is searching). */
export function useAllProviders(enabled: boolean) {
  return useQuery({ queryKey: ['providers', 'all'], queryFn: getAllProviders, enabled });
}
