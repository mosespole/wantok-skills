import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createService,
  deleteService,
  getActiveServicesByProvider,
  getMyServices,
  getServiceById,
  updateService,
} from '@/services/firebase/serviceService';
import { fetchActiveServicesWithFallback } from '@/services/cache/activeServicesCache';
import { ensureOnline } from '@/services/network/networkService';
import type { ServiceInput } from '@/types/service';

import { useAuth } from './useAuth';

/** Cache keys. Every listing query starts with 'services' so one invalidation refreshes them all. */
export const serviceKeys = {
  all: ['services'] as const,
  active: () => [...serviceKeys.all, 'active'] as const,
  mine: (uid: string) => [...serviceKeys.all, 'mine', uid] as const,
  byProvider: (providerId: string) => [...serviceKeys.all, 'provider', providerId] as const,
  detail: (serviceId: string) => [...serviceKeys.all, 'detail', serviceId] as const,
};

/**
 * Active marketplace listings. Falls back to the copy saved in AsyncStorage when
 * offline; `data.source` says whether the listings are live or saved.
 */
export function useActiveServices() {
  return useQuery({ queryKey: serviceKeys.active(), queryFn: fetchActiveServicesWithFallback });
}

export function useMyServices() {
  const { user } = useAuth();
  const uid = user?.uid ?? '';
  return useQuery({
    queryKey: serviceKeys.mine(uid),
    queryFn: () => getMyServices(uid),
    enabled: uid !== '',
  });
}

export function useProviderServices(providerId: string) {
  return useQuery({
    queryKey: serviceKeys.byProvider(providerId),
    queryFn: () => getActiveServicesByProvider(providerId),
    enabled: providerId !== '',
  });
}

export function useService(serviceId: string) {
  return useQuery({
    queryKey: serviceKeys.detail(serviceId),
    queryFn: () => getServiceById(serviceId),
    enabled: serviceId !== '',
  });
}

export function useCreateService() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ServiceInput) => {
      if (!user) throw new Error('errors.loginToCreateListing');
      await ensureOnline();
      return createService(user.uid, input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      serviceId,
      input,
    }: {
      serviceId: string;
      input: Partial<ServiceInput>;
    }) => {
      await ensureOnline();
      return updateService(serviceId, input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ serviceId, imageUrl }: { serviceId: string; imageUrl: string | null }) => {
      await ensureOnline();
      return deleteService(serviceId, imageUrl);
    },
    onSuccess: (_result, { serviceId }) => {
      queryClient.removeQueries({ queryKey: serviceKeys.detail(serviceId) });
      return queryClient.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}
