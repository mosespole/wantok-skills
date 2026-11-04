import { CustomerHome } from '@/components/home/CustomerHome';
import { ProviderDashboard } from '@/components/home/ProviderDashboard';
import { useAuth } from '@/hooks/useAuth';

/** First tab: customers get the marketplace Home, providers get their Dashboard. */
export default function HomeTab() {
  const { profile } = useAuth();
  return profile?.role === 'provider' ? <ProviderDashboard /> : <CustomerHome />;
}
