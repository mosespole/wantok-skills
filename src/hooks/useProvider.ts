import { useQuery } from '@tanstack/react-query';

import { getProviderSummary } from '@/services/firebase/userService';

export function useProvider(providerId: string) {
  return useQuery({
    queryKey: ['providers', providerId],
    queryFn: () => getProviderSummary(providerId),
    enabled: providerId !== '',
  });
}
