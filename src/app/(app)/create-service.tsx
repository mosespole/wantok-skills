import { router, Stack } from 'expo-router';

import { AppText, Screen } from '@/components/common';
import { ServiceForm } from '@/components/forms/ServiceForm';
import { useAuth } from '@/hooks/useAuth';
import { useCreateService } from '@/hooks/useServices';
import { toServiceInput } from '@/utils/validation';

export default function CreateServiceScreen() {
  const { profile } = useAuth();
  const createService = useCreateService();

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: 'New listing' }} />
      <AppText color="textSecondary">
        Tell customers what you offer. Required fields are checked before publishing.
      </AppText>
      <ServiceForm
        submitLabel="Publish listing"
        // Pre-fill contact details from the provider's profile to save typing.
        defaultValues={{
          title: '',
          description: '',
          locationName: profile?.locationName ?? '',
          contactNumber: profile?.phoneNumber ?? '',
          startingPrice: '',
          isActive: true,
          latitude: profile?.latitude ?? null,
          longitude: profile?.longitude ?? null,
        }}
        onSubmit={async (values) => {
          const serviceId = await createService.mutateAsync(toServiceInput(values, null));
          router.replace({ pathname: '/service/[id]', params: { id: serviceId } });
        }}
      />
    </Screen>
  );
}
