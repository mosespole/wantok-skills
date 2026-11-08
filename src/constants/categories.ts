import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { isTranslationKey, t } from '@/i18n';

type IconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Service categories offered in the marketplace. `id` is what is stored in Firestore.
 * `color` and `tint` give each category its own icon colour and soft background,
 * so category tiles and listing cards are easy to tell apart at a glance.
 */
export const CATEGORIES = [
  {
    id: 'carpentry',
    label: 'Carpentry',
    icon: 'hammer-outline',
    color: '#8B5E34',
    tint: '#F6EDE3',
  },
  { id: 'plumbing', label: 'Plumbing', icon: 'water-outline', color: '#1E6FB8', tint: '#E6F0FA' },
  {
    id: 'electrical',
    label: 'Electrical',
    icon: 'flash-outline',
    color: '#B67D00',
    tint: '#FDF4DC',
  },
  {
    id: 'computer-repair',
    label: 'Computer Repair',
    icon: 'laptop-outline',
    color: '#4B57C9',
    tint: '#ECEEFC',
  },
  { id: 'tutoring', label: 'Tutoring', icon: 'school-outline', color: '#7A3FB5', tint: '#F2EAFB' },
  { id: 'tailoring', label: 'Tailoring', icon: 'shirt-outline', color: '#C2367A', tint: '#FBE8F1' },
  {
    id: 'photography',
    label: 'Photography',
    icon: 'camera-outline',
    color: '#C94F26',
    tint: '#FDECE5',
  },
  { id: 'gardening', label: 'Gardening', icon: 'leaf-outline', color: '#2E8B57', tint: '#E6F4EC' },
  {
    id: 'graphic-design',
    label: 'Graphic Design',
    icon: 'color-palette-outline',
    color: '#0E8C8C',
    tint: '#E2F4F4',
  },
] as const satisfies readonly {
  id: string;
  label: string;
  icon: IconName;
  color: string;
  tint: string;
}[];

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export const CATEGORY_IDS = CATEGORIES.map((category) => category.id) as [
  CategoryId,
  ...CategoryId[],
];

/** Category name in the app's current language (`label` above is the English name). */
export function getCategoryLabel(id: string): string {
  const key = `category.${id}`;
  return isTranslationKey(key) ? t(key) : t('category.other');
}

/** English name, used so search matches English words whichever language is shown. */
export function getCategoryEnglishLabel(id: string): string {
  return CATEGORIES.find((category) => category.id === id)?.label ?? 'Other';
}

const FALLBACK_STYLE = {
  icon: 'construct-outline' as IconName,
  color: '#1F5F3F',
  tint: '#E4F0E8',
};

/** Icon and colours for a category id, with a neutral fallback for unknown ids. */
export function getCategoryStyle(id: string): { icon: IconName; color: string; tint: string } {
  return CATEGORIES.find((category) => category.id === id) ?? FALLBACK_STYLE;
}
