import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';

import type { ServiceInput, ServiceListing, ServiceWithProvider } from '@/types/service';

import { db } from './firebaseConfig';
import { deleteImageByUrl } from './storageService';
import { getProviderSummaries, getProviderSummary } from './userService';

const SERVICES = 'services';
const servicesCollection = collection(db, SERVICES);

// Enough for a regional marketplace; search and filtering happen on the device.
const MAX_ACTIVE_LISTINGS = 300;

function toDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

function mapService(serviceId: string, data: DocumentData): ServiceListing {
  return {
    serviceId,
    providerId: data.providerId ?? '',
    title: data.title ?? '',
    category: data.category ?? '',
    description: data.description ?? '',
    locationName: data.locationName ?? '',
    latitude: typeof data.latitude === 'number' ? data.latitude : null,
    longitude: typeof data.longitude === 'number' ? data.longitude : null,
    contactNumber: data.contactNumber ?? '',
    startingPrice: typeof data.startingPrice === 'number' ? data.startingPrice : null,
    imageUrl: data.imageUrl ?? null,
    isActive: data.isActive === true,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

/** Newest first. Listings still waiting for their server timestamp sort to the top. */
function newestFirst(a: ServiceListing, b: ServiceListing): number {
  const aTime = a.createdAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const bTime = b.createdAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  return bTime - aTime;
}

/** Attaches each listing's provider details, looked up from the `users` collection. */
async function withProviders(listings: ServiceListing[]): Promise<ServiceWithProvider[]> {
  const providers = await getProviderSummaries(listings.map((listing) => listing.providerId));
  return listings.map((listing) => ({
    ...listing,
    provider: providers.get(listing.providerId) ?? null,
  }));
}

// ---------- READ ----------

/** All active listings in the marketplace, newest first, with provider details. */
export async function getActiveServices(): Promise<ServiceWithProvider[]> {
  const snapshot = await getDocs(
    query(servicesCollection, where('isActive', '==', true), limit(MAX_ACTIVE_LISTINGS)),
  );
  const listings = snapshot.docs.map((d) => mapService(d.id, d.data())).sort(newestFirst);
  return withProviders(listings);
}

/** Every listing owned by a provider, including paused ones (only the owner may call this). */
export async function getMyServices(providerId: string): Promise<ServiceListing[]> {
  const snapshot = await getDocs(query(servicesCollection, where('providerId', '==', providerId)));
  return snapshot.docs.map((d) => mapService(d.id, d.data())).sort(newestFirst);
}

/** Active listings of one provider, for their public profile page. */
export async function getActiveServicesByProvider(providerId: string): Promise<ServiceListing[]> {
  const snapshot = await getDocs(
    query(servicesCollection, where('providerId', '==', providerId), where('isActive', '==', true)),
  );
  return snapshot.docs.map((d) => mapService(d.id, d.data())).sort(newestFirst);
}

/** One listing with its provider, or null if it does not exist. */
export async function getServiceById(serviceId: string): Promise<ServiceWithProvider | null> {
  const snapshot = await getDoc(doc(db, SERVICES, serviceId));
  if (!snapshot.exists()) return null;
  const listing = mapService(snapshot.id, snapshot.data());
  const provider = await getProviderSummary(listing.providerId).catch(() => null);
  return { ...listing, provider };
}

// ---------- CREATE ----------

/** Publishes a new listing owned by `providerId`. Returns the new document ID. */
export async function createService(providerId: string, input: ServiceInput): Promise<string> {
  const reference = await addDoc(servicesCollection, {
    ...input,
    providerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return reference.id;
}

// ---------- UPDATE ----------

/** Saves changes to a listing. Security rules reject this unless the caller owns it. */
export async function updateService(serviceId: string, input: Partial<ServiceInput>) {
  await updateDoc(doc(db, SERVICES, serviceId), { ...input, updatedAt: serverTimestamp() });
}

// ---------- DELETE ----------

/**
 * Permanently removes a listing, then its photo from Storage.
 * Security rules reject this unless the caller owns the listing.
 */
export async function deleteService(serviceId: string, imageUrl: string | null) {
  await deleteDoc(doc(db, SERVICES, serviceId));
  // The listing is already gone; a leftover photo is harmless, so clean-up errors are ignored.
  if (imageUrl) await deleteImageByUrl(imageUrl).catch(() => undefined);
}
