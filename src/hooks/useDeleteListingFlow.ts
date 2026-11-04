import { useState } from 'react';

import type { ServiceListing } from '@/types/service';
import { getErrorMessage } from '@/utils/errors';

import { useDeleteService } from './useServices';

type DeleteTarget = Pick<ServiceListing, 'serviceId' | 'title' | 'imageUrl'>;

/**
 * State for "Delete listing?" confirmation, shared by My Services and the
 * listing details screen. Pair it with <ConfirmDialog />.
 */
export function useDeleteListingFlow(onDeleted?: () => void) {
  const deleteService = useDeleteService();
  const [target, setTarget] = useState<DeleteTarget | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!target) return;
    setError(null);
    try {
      await deleteService.mutateAsync({ serviceId: target.serviceId, imageUrl: target.imageUrl });
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
    requestDelete: (listing: DeleteTarget) => {
      setError(null);
      setTarget(listing);
    },
    cancelDelete: () => setTarget(null),
    confirmDelete,
  };
}
