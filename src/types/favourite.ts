/**
 * A document in the `favourites` collection.
 * The document ID is `${customerId}_${providerId}`, which prevents duplicates
 * and lets security rules check ownership without an extra read.
 */
export interface Favourite {
  favouriteId: string;
  customerId: string;
  providerId: string;
  createdAt: Date | null;
}
