import { getCategoryLabel } from '@/constants/categories';
import type { ServiceWithProvider } from '@/types/service';

export interface ServiceFilters {
  /** Matches listing title, description, category, location or provider name. */
  text?: string;
  /** Category ID, or undefined for all categories. */
  category?: string;
  /** Matches the listing's location name, e.g. "Lae". */
  location?: string;
}

const normalise = (value: string) => value.trim().toLowerCase();

/**
 * Filters listings already fetched from Firestore. Firestore has no full-text
 * search, so matching "contains" across several fields happens on the device.
 */
export function filterServices(
  services: ServiceWithProvider[],
  filters: ServiceFilters,
): ServiceWithProvider[] {
  const text = normalise(filters.text ?? '');
  const location = normalise(filters.location ?? '');

  return services.filter((service) => {
    if (filters.category && service.category !== filters.category) return false;
    if (location && !normalise(service.locationName).includes(location)) return false;
    if (!text) return true;

    const haystack = [
      service.title,
      service.description,
      getCategoryLabel(service.category),
      service.locationName,
      service.provider?.fullName ?? '',
    ]
      .join(' ')
      .toLowerCase();
    // Every word typed must appear somewhere, so "lae plumber" narrows results.
    return text.split(/\s+/).every((word) => haystack.includes(word));
  });
}
