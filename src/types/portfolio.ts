/**
 * A document in the `portfolio` collection: one completed project a provider
 * shows as evidence of their skills ("Past work").
 */
export interface PortfolioItem {
  itemId: string;
  providerId: string;
  /** Compressed JPEG stored as a base64 data URI (see imageCompression.ts). */
  imageData: string;
  caption: string;
  category: string;
  /** Empty string when not given. */
  locationName: string;
  completedAt: Date;
  createdAt: Date | null;
}

/** The fields a provider fills in when adding or editing a project. */
export type PortfolioInput = Pick<
  PortfolioItem,
  'imageData' | 'caption' | 'category' | 'locationName' | 'completedAt'
>;
