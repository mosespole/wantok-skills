import type { Coordinates } from '@/services/location/locationService';
import type { ProviderSummary, ServiceWithProvider } from '@/types/service';

/** One marker on the map: a provider and the active listings they offer. */
export interface ProviderPin {
  providerId: string;
  provider: ProviderSummary;
  coordinate: Coordinates;
  listingCount: number;
  /** Category IDs of the provider's listings, without duplicates. */
  categories: string[];
}

function toCoordinates(latitude: number | null, longitude: number | null): Coordinates | null {
  return latitude !== null && longitude !== null ? { latitude, longitude } : null;
}

/**
 * Groups active listings into one pin per provider. The pin uses the provider's
 * own saved position if they set one, otherwise the first listing that has
 * coordinates. Providers with no saved coordinates are left off the map;
 * the app never invents a position for them.
 */
export function buildProviderPins(services: ServiceWithProvider[]): ProviderPin[] {
  // Step 1: group listings by provider.
  const byProvider = new Map<string, ServiceWithProvider[]>();
  for (const service of services) {
    if (!service.provider) continue;
    const group = byProvider.get(service.providerId) ?? [];
    group.push(service);
    byProvider.set(service.providerId, group);
  }

  // Step 2: turn each group into a pin, if a real position is available.
  const pins: ProviderPin[] = [];
  for (const [providerId, listings] of byProvider) {
    const provider = listings[0].provider!;
    const coordinate =
      toCoordinates(provider.latitude, provider.longitude) ??
      listings
        .map((listing) => toCoordinates(listing.latitude, listing.longitude))
        .find((position) => position !== null) ??
      null;
    if (!coordinate) continue;

    pins.push({
      providerId,
      provider,
      coordinate,
      listingCount: listings.length,
      categories: [...new Set(listings.map((listing) => listing.category))],
    });
  }
  return pins;
}
