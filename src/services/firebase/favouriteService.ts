import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';

import type { Favourite } from '@/types/favourite';
import type { ProviderSummary } from '@/types/service';

import { db } from './firebaseConfig';
import { getProviderSummaries } from './userService';

const FAVOURITES = 'favourites';

/** Deterministic ID: one favourite per customer/provider pair, checked by the security rules. */
function favouriteId(customerId: string, providerId: string): string {
  return `${customerId}_${providerId}`;
}

export async function getFavourites(customerId: string): Promise<Favourite[]> {
  const snapshot = await getDocs(
    query(collection(db, FAVOURITES), where('customerId', '==', customerId)),
  );
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      favouriteId: d.id,
      customerId: data.customerId,
      providerId: data.providerId,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
    };
  });
}

/** The customer's saved providers with their public details, most recently saved first. */
export async function getFavouriteProviders(customerId: string): Promise<ProviderSummary[]> {
  const favourites = await getFavourites(customerId);
  favourites.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  const providers = await getProviderSummaries(favourites.map((f) => f.providerId));
  return favourites
    .map((favourite) => providers.get(favourite.providerId))
    .filter((provider): provider is ProviderSummary => provider !== undefined);
}

export async function addFavourite(customerId: string, providerId: string) {
  await setDoc(doc(db, FAVOURITES, favouriteId(customerId, providerId)), {
    customerId,
    providerId,
    createdAt: serverTimestamp(),
  });
}

export async function removeFavourite(customerId: string, providerId: string) {
  await deleteDoc(doc(db, FAVOURITES, favouriteId(customerId, providerId)));
}
