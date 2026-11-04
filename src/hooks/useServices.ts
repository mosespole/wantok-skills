import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createService,
  deleteService,
  getActiveServices,
  getActiveServicesByProvider,
  getMyServices,
  getServiceById,
  updateService,
} from '@/services/firebase/serviceService';
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

export function useActiveServices() {
  return useQuery({ queryKey: serviceKeys.active(), queryFn: getActiveServices });
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
    mutationFn: (input: ServiceInput) => {
      if (!user) throw new Error('You must be logged in to create a listing.');
      return createService(user.uid, input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, input }: { serviceId: string; input: Partial<ServiceInput> }) =>
      updateService(serviceId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceId: string) => deleteService(serviceId),
    onSuccess: (_result, serviceId) => {
      queryClient.removeQueries({ queryKey: serviceKeys.detail(serviceId) });
      return queryClient.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}
