import { router, Stack, useLocalSearchParams } from 'expo-router';

import { EmptyState, ErrorState, LoadingState, Screen } from '@/components/common';
import { ServiceForm } from '@/components/forms/ServiceForm';
import type { CategoryId } from '@/constants/categories';
import { useAuth } from '@/hooks/useAuth';
import { useServiceImage } from '@/hooks/useServiceImage';
import { useService, useUpdateService } from '@/hooks/useServices';
import { getErrorMessage } from '@/utils/errors';
import { toServiceInput } from '@/utils/validation';

import { t } from '@/i18n';
export default function EditServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const serviceQuery = useService(id ?? '');
  const updateService = useUpdateService();
  const serviceImage = useServiceImage();

  const listing = serviceQuery.data;

  let content;
  if (serviceQuery.isLoading) {
    content = <LoadingState message={t('listing.loading')} />;
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
        title={t('editService.unavailableTitle')}
        message={t('editService.unavailableMessage')}
        actionLabel={t('common.goBack')}
        onAction={() => router.back()}
      />
    );
  } else {
    content = (
      <ServiceForm
        submitLabel={t('common.saveChanges')}
        showActiveToggle
        currentImageUrl={listing.imageUrl}
        uploadProgress={serviceImage.uploadProgress}
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
        onSubmit={async (values, imageChange) => {
          const { imageUrl, replacedUrl } = await serviceImage.resolveImageUrl(
            imageChange,
            listing.imageUrl,
          );
          await updateService.mutateAsync({
            serviceId: listing.serviceId,
            input: toServiceInput(values, imageUrl),
          });
          // Only now that the listing points at the new photo is the old one removed.
          await serviceImage.cleanUp(replacedUrl);
          router.back();
        }}
      />
    );
  }

  return (
    <Screen edges={['bottom']} scroll={Boolean(listing)}>
      <Stack.Screen options={{ title: t('screens.editListing') }} />
      {content}
    </Screen>
  );
}
