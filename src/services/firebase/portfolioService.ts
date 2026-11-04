import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';

import type { PortfolioInput, PortfolioItem } from '@/types/portfolio';

import { db } from './firebaseConfig';

const PORTFOLIO = 'portfolio';
const portfolioCollection = collection(db, PORTFOLIO);

/** Keeps each provider's gallery (and the data downloaded for it) to a sensible size. */
export const MAX_PORTFOLIO_ITEMS = 12;

function mapItem(itemId: string, data: DocumentData): PortfolioItem {
  return {
    itemId,
    providerId: data.providerId ?? '',
    imageData: data.imageData ?? '',
    caption: data.caption ?? '',
    category: data.category ?? '',
    locationName: data.locationName ?? '',
    completedAt: data.completedAt instanceof Timestamp ? data.completedAt.toDate() : new Date(0),
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
  };
}

/** A provider's past work, most recently completed first. */
export async function getPortfolio(providerId: string): Promise<PortfolioItem[]> {
  const snapshot = await getDocs(query(portfolioCollection, where('providerId', '==', providerId)));
  return snapshot.docs
    .map((d) => mapItem(d.id, d.data()))
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
}

export async function getPortfolioItem(itemId: string): Promise<PortfolioItem | null> {
  const snapshot = await getDoc(doc(db, PORTFOLIO, itemId));
  return snapshot.exists() ? mapItem(snapshot.id, snapshot.data()) : null;
}

function toFirestore(input: PortfolioInput) {
  return {
    imageData: input.imageData,
    caption: input.caption.trim(),
    category: input.category,
    locationName: input.locationName.trim(),
    completedAt: Timestamp.fromDate(input.completedAt),
  };
}

/** Adds a project. The limit is checked here; security rules check ownership and field sizes. */
export async function addPortfolioItem(providerId: string, input: PortfolioInput): Promise<string> {
  const existing = await getDocs(query(portfolioCollection, where('providerId', '==', providerId)));
  if (existing.size >= MAX_PORTFOLIO_ITEMS) {
    throw new Error(
      `You can show up to ${MAX_PORTFOLIO_ITEMS} projects. Delete one to add another.`,
    );
  }
  const reference = await addDoc(portfolioCollection, {
    ...toFirestore(input),
    providerId,
    createdAt: serverTimestamp(),
  });
  return reference.id;
}

export async function updatePortfolioItem(itemId: string, input: PortfolioInput) {
  await updateDoc(doc(db, PORTFOLIO, itemId), toFirestore(input));
}

export async function deletePortfolioItem(itemId: string) {
  await deleteDoc(doc(db, PORTFOLIO, itemId));
}
