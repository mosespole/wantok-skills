import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import {
  AppButton,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from '@/components/common';
import { FormError } from '@/components/forms/FormError';
import { PortfolioForm } from '@/components/forms/PortfolioForm';
import type { CategoryId } from '@/constants/categories';
import { useAuth } from '@/hooks/useAuth';
import {
  useDeletePortfolioItem,
  usePortfolioItem,
  useUpdatePortfolioItem,
} from '@/hooks/usePortfolio';
import { getErrorMessage } from '@/utils/errors';

export default function EditWorkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const itemQuery = usePortfolioItem(id ?? '');
  const updateItem = useUpdatePortfolioItem();
  const deleteItem = useDeletePortfolioItem();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const item = itemQuery.data;

  // After a delete the item query is cleared; render nothing while navigating back,
  // instead of briefly flashing "Project unavailable".
  if (deleteItem.isSuccess) return null;
  if (itemQuery.isLoading) return <LoadingState message="Loading project..." />;
  if (itemQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(itemQuery.error)}
        onRetry={() => itemQuery.refetch()}
        retrying={itemQuery.isFetching}
      />
    );
  }
  if (!item || item.providerId !== user?.uid) {
    // Security rules reject edits by anyone else; this explains it early.
    return (
      <EmptyState
        icon="lock-closed-outline"
        title="Project unavailable"
        message="This project does not exist or does not belong to you."
        actionLabel="Go back"
        onAction={() => router.back()}
      />
    );
  }

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await deleteItem.mutateAsync(item.itemId);
      setConfirmVisible(false);
      router.dismissTo('/my-work');
    } catch (error) {
      setDeleteError(getErrorMessage(error));
      setConfirmVisible(false);
    }
  };

  return (
    <Screen edges={['bottom']}>
      <PortfolioForm
        submitLabel="Save changes"
        initialImageData={item.imageData}
        defaultValues={{
          caption: item.caption,
          category: item.category as CategoryId,
          locationName: item.locationName,
          completedAt: item.completedAt,
        }}
        onSubmit={async (input) => {
          await updateItem.mutateAsync({ itemId: item.itemId, input });
          router.back();
        }}
      />

      <FormError message={deleteError} />
      <AppButton
        title="Delete project"
        icon="trash-outline"
        variant="ghost"
        onPress={() => setConfirmVisible(true)}
      />

      <ConfirmDialog
        visible={confirmVisible}
        title="Delete this project?"
        message={`"${item.caption}" will be removed from your past work. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteItem.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </Screen>
  );
}
