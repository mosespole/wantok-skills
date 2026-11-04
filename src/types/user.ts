export type UserRole = 'customer' | 'provider';

/** A document in the `users` collection. The document ID is the Firebase Auth UID. */
export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  profileImageUrl: string | null;
  bio: string;
  /** Provider's primary skill category. Empty for customers. */
  skillCategory: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
