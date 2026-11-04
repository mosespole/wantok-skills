import { useState } from 'react';

import type { ServiceListing } from '@/types/service';
import { getErrorMessage } from '@/utils/errors';

import { useDeleteService } from './useServices';

/**
 * State for "Delete listing?" confirmation, shared by My Services and the
 * listing details screen. Pair it with <ConfirmDialog />.
 */
export function useDeleteListingFlow(onDeleted?: () => void) {
  const deleteService = useDeleteService();
  const [target, setTarget] = useState<Pick<ServiceListing, 'serviceId' | 'title'> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!target) return;
    setError(null);
    try {
      await deleteService.mutateAsync(target.serviceId);
      setTarget(null);
      onDeleted?.();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
      setTarget(null);
    }
  };

  return {
    target,
    error,
    isDeleting: deleteService.isPending,
    requestDelete: (listing: Pick<ServiceListing, 'serviceId' | 'title'>) => {
      setError(null);
      setTarget(listing);
    },
    cancelDelete: () => setTarget(null),
    confirmDelete,
  };
}
