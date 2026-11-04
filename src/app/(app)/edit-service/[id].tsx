import { router, Stack, useLocalSearchParams } from 'expo-router';

import { EmptyState, ErrorState, LoadingState, Screen } from '@/components/common';
import { ServiceForm } from '@/components/forms/ServiceForm';
import type { CategoryId } from '@/constants/categories';
import { useAuth } from '@/hooks/useAuth';
import { useService, useUpdateService } from '@/hooks/useServices';
import { getErrorMessage } from '@/utils/errors';
import { toServiceInput } from '@/utils/validation';

export default function EditServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const serviceQuery = useService(id ?? '');
  const updateService = useUpdateService();

  const listing = serviceQuery.data;

  let content;
  if (serviceQuery.isLoading) {
    content = <LoadingState message="Loading listing..." />;
  } else if (serviceQuery.isError) {
    content = (
      <ErrorState
        message={getErrorMessage(serviceQuery.error)}
        onRetry={() => serviceQuery.refetch()}
        retrying={serviceQuery.isFetching}
      />
    );
  } else if (!listing || listing.providerId !== user?.uid) {
    // The security rules would reject the save anyway; this just explains it early.
    content = (
      <EmptyState
        icon="lock-closed-outline"
        title="Listing unavailable"
        message="This listing does not exist or does not belong to you."
        actionLabel="Go back"
        onAction={() => router.back()}
      />
    );
  } else {
    content = (
      <ServiceForm
        submitLabel="Save changes"
        showActiveToggle
        defaultValues={{
          title: listing.title,
          category: listing.category as CategoryId,
          description: listing.description,
          locationName: listing.locationName,
          contactNumber: listing.contactNumber,
          startingPrice: listing.startingPrice === null ? '' : String(listing.startingPrice),
          isActive: listing.isActive,
          latitude: listing.latitude,
          longitude: listing.longitude,
        }}
        onSubmit={async (values) => {
          await updateService.mutateAsync({
            serviceId: listing.serviceId,
            input: toServiceInput(values, listing.imageUrl),
          });
          router.back();
        }}
      />
    );
  }

  return (
    <Screen edges={['bottom']} scroll={Boolean(listing)}>
      <Stack.Screen options={{ title: 'Edit listing' }} />
      {content}
    </Screen>
  );
}
