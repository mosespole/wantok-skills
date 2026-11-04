import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';

import type { ProviderSummary } from '@/types/service';
import type { UserProfile, UserRole } from '@/types/user';

import { db } from './firebaseConfig';
import { getRatingSummary } from './reviewService';

const USERS = 'users';

function toDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

/** Converts a raw Firestore document into a typed UserProfile with safe defaults. */
function mapUserProfile(uid: string, data: DocumentData): UserProfile {
  return {
    uid,
    fullName: data.fullName ?? '',
    email: data.email ?? '',
    phoneNumber: data.phoneNumber ?? '',
    role: data.role === 'provider' ? 'provider' : 'customer',
    profileImageUrl: data.profileImageUrl ?? null,
    bio: data.bio ?? '',
    skillCategory: data.skillCategory ?? '',
    locationName: data.locationName ?? '',
    latitude: typeof data.latitude === 'number' ? data.latitude : null,
    longitude: typeof data.longitude === 'number' ? data.longitude : null,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export interface NewUserProfile {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
}

/** Creates the `users/{uid}` document straight after Firebase Auth registration. */
export async function createUserProfile(input: NewUserProfile): Promise<UserProfile> {
  const profile = {
    ...input,
    profileImageUrl: null,
    bio: '',
    skillCategory: '',
    locationName: '',
    latitude: null,
    longitude: null,
  };
  await setDoc(doc(db, USERS, input.uid), {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const now = new Date();
  return { ...profile, createdAt: now, updatedAt: now };
}

/** Returns the profile, or null if the document does not exist yet. */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, USERS, uid));
  return snapshot.exists() ? mapUserProfile(snapshot.id, snapshot.data()) : null;
}

/** Fields a user may change themselves. `role`, `email` and `uid` are deliberately excluded. */
export type EditableProfileFields = Partial<
  Pick<
    UserProfile,
    | 'fullName'
    | 'phoneNumber'
    | 'bio'
    | 'skillCategory'
    | 'locationName'
    | 'latitude'
    | 'longitude'
    | 'profileImageUrl'
  >
>;

export async function updateUserProfile(uid: string, updates: EditableProfileFields) {
  await updateDoc(doc(db, USERS, uid), { ...updates, updatedAt: serverTimestamp() });
}

function toProviderSummary(
  profile: UserProfile,
  rating: ProviderSummary['rating'],
): ProviderSummary {
  const { uid, fullName, phoneNumber, profileImageUrl, bio, skillCategory } = profile;
  const { locationName, latitude, longitude } = profile;
  return {
    uid,
    fullName,
    phoneNumber,
    profileImageUrl,
    bio,
    skillCategory,
    locationName,
    latitude,
    longitude,
    rating,
  };
}

/**
 * Public details of one provider with their star rating, or null if they no longer exist.
 * A rating that cannot be loaded is shown as "no rating" rather than failing the page.
 */
export async function getProviderSummary(uid: string): Promise<ProviderSummary | null> {
  const [snapshot, rating] = await Promise.all([
    getDoc(doc(db, USERS, uid)),
    getRatingSummary(uid).catch(() => null),
  ]);
  if (!snapshot.exists()) return null;
  const profile = mapUserProfile(snapshot.id, snapshot.data());
  return profile.role === 'provider' ? toProviderSummary(profile, rating) : null;
}

/**
 * Loads several providers in parallel, keyed by UID. A provider that cannot be
 * read (deleted, or not a provider) is simply left out rather than failing the whole list.
 */
export async function getProviderSummaries(uids: string[]): Promise<Map<string, ProviderSummary>> {
  const uniqueIds = [...new Set(uids)];
  const results = await Promise.allSettled(uniqueIds.map((uid) => getProviderSummary(uid)));
  const providers = new Map<string, ProviderSummary>();
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      providers.set(result.value.uid, result.value);
    }
  });
  return providers;
}
