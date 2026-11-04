import type { RatingSummary } from './review';
import type { UserProfile } from './user';

/** A document in the `services` collection. Each listing belongs to one provider. */
export interface ServiceListing {
  serviceId: string;
  providerId: string;
  title: string;
  category: string;
  description: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  contactNumber: string;
  startingPrice: number | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

/** The fields a provider fills in when creating or editing a listing. */
export type ServiceInput = Omit<
  ServiceListing,
  'serviceId' | 'providerId' | 'createdAt' | 'updatedAt'
>;

/** Public provider details shown alongside a listing (read from `users`, not copied into it). */
export type ProviderSummary = ProviderProfileFields & {
  /** Average stars and review count; null if it could not be loaded. */
  rating: RatingSummary | null;
};

type ProviderProfileFields = Pick<
  UserProfile,
  | 'uid'
  | 'fullName'
  | 'phoneNumber'
  | 'profileImageUrl'
  | 'bio'
  | 'skillCategory'
  | 'locationName'
  | 'latitude'
  | 'longitude'
>;

/** A listing joined with its provider's public details, ready to display. */
export interface ServiceWithProvider extends ServiceListing {
  provider: ProviderSummary | null;
}
