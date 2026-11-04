import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Service categories offered in the marketplace. `id` is what is stored in Firestore. */
export const CATEGORIES = [
  { id: 'carpentry', label: 'Carpentry', icon: 'hammer-outline' },
  { id: 'plumbing', label: 'Plumbing', icon: 'water-outline' },
  { id: 'electrical', label: 'Electrical', icon: 'flash-outline' },
  { id: 'computer-repair', label: 'Computer Repair', icon: 'laptop-outline' },
  { id: 'tutoring', label: 'Tutoring', icon: 'school-outline' },
  { id: 'tailoring', label: 'Tailoring', icon: 'shirt-outline' },
  { id: 'photography', label: 'Photography', icon: 'camera-outline' },
  { id: 'gardening', label: 'Gardening', icon: 'leaf-outline' },
  { id: 'graphic-design', label: 'Graphic Design', icon: 'color-palette-outline' },
] as const satisfies readonly { id: string; label: string; icon: IconName }[];

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export const CATEGORY_IDS = CATEGORIES.map((category) => category.id) as [
  CategoryId,
  ...CategoryId[],
];

export function getCategoryLabel(id: string): string {
  return CATEGORIES.find((category) => category.id === id)?.label ?? 'Other';
}
