import { router } from 'expo-router';

import { AppText, Screen } from '@/components/common';
import { PortfolioForm } from '@/components/forms/PortfolioForm';
import type { CategoryId } from '@/constants/categories';
import { useAuth } from '@/hooks/useAuth';
import { useAddPortfolioItem } from '@/hooks/usePortfolio';

import { t } from '@/i18n';
export default function AddWorkScreen() {
  const { profile } = useAuth();
  const addItem = useAddPortfolioItem();

  return (
    <Screen edges={['bottom']}>
      <AppText color="textSecondary">{t('addWork.intro')}</AppText>
      <PortfolioForm
        submitLabel={t('addWork.submit')}
        defaultValues={{
          caption: '',
          // Most projects match the provider's main skill, so start with it selected.
          category: (profile?.skillCategory || undefined) as CategoryId | undefined,
          locationName: profile?.locationName ?? '',
        }}
        onSubmit={async (input) => {
          await addItem.mutateAsync(input);
          router.back();
        }}
      />
    </Screen>
  );
}
