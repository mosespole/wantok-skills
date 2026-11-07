import { z } from 'zod';

import { CATEGORY_IDS } from '@/constants/categories';
import type { ServiceInput } from '@/types/service';

import { toLocalPhoneDigits } from './formatting';

const email = z.string().trim().min(1, 'Email is required').email('Enter a valid email address');

// PNG mobiles have 8 digits (starting with 7); landlines have 7 digits.
export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .refine((value) => /^[\d\s+()-]+$/.test(value), 'Use numbers only (spaces, + and - are fine)')
  .refine((value) => {
    const local = toLocalPhoneDigits(value);
    return local.length === 7 || local.length === 8;
  }, 'Enter a valid PNG number, e.g. 7123 4567');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Enter your full name')
      .max(60, 'Name must be 60 characters or fewer'),
    email,
    phoneNumber: phoneSchema,
    role: z.enum(['customer', 'provider'], { message: 'Choose an account type' }),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Include at least one letter')
      .regex(/\d/, 'Include at least one number'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({ email });

const MAX_PRICE = 1_000_000;

/**
 * Create/Edit listing form. Price is typed as text so the field can be left
 * empty; `toServiceInput` converts it to a number (or null) before saving.
 */
export const serviceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(80, 'Title must be 80 characters or fewer'),
  category: z.enum(CATEGORY_IDS, { message: 'Choose a category' }),
  description: z
    .string()
    .trim()
    .min(10, 'Describe your service in at least 10 characters')
    .max(1000, 'Description must be 1000 characters or fewer'),
  locationName: z
    .string()
    .trim()
    .min(2, 'Enter where you work, e.g. Lae, Morobe')
    .max(100, 'Location must be 100 characters or fewer'),
  contactNumber: phoneSchema,
  startingPrice: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || /^\d+(\.\d{1,2})?$/.test(value),
      'Enter a price in kina, e.g. 50',
    )
    .refine(
      (value) => value === '' || Number(value) <= MAX_PRICE,
      `Price must be K${MAX_PRICE.toLocaleString('en-US')} or less`,
    ),
  isActive: z.boolean(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

export function toServiceInput(values: ServiceFormValues, imageUrl: string | null): ServiceInput {
  return {
    title: values.title.trim(),
    category: values.category,
    description: values.description.trim(),
    locationName: values.locationName.trim(),
    contactNumber: toLocalPhoneDigits(values.contactNumber),
    startingPrice: values.startingPrice === '' ? null : Number(values.startingPrice),
    isActive: values.isActive,
    latitude: values.latitude,
    longitude: values.longitude,
    imageUrl,
  };
}

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Enter your full name')
    .max(60, 'Name must be 60 characters or fewer'),
  phoneNumber: phoneSchema,
  bio: z.string().trim().max(500, 'Bio must be 500 characters or fewer'),
  // '' means "not set"; customers never set a skill.
  skillCategory: z.union([z.enum(CATEGORY_IDS), z.literal('')]),
  locationName: z.string().trim().max(100, 'Location must be 100 characters or fewer'),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

/** Add/Edit past work. The photo is handled separately (it is picked and compressed, not typed). */
export const portfolioSchema = z.object({
  caption: z
    .string()
    .trim()
    .min(3, 'Describe the project in at least 3 characters')
    .max(120, 'Caption must be 120 characters or fewer'),
  category: z.enum(CATEGORY_IDS, { message: 'Choose a category' }),
  locationName: z.string().trim().max(100, 'Location must be 100 characters or fewer'),
  completedAt: z
    .date({ message: 'Choose the date the work was completed' })
    // Checked against the current time on every submit (allowing for time zones).
    .refine((date) => date.getTime() <= Date.now() + 24 * 60 * 60 * 1000, {
      message: 'The date cannot be in the future',
    }),
});

export type PortfolioFormValues = z.infer<typeof portfolioSchema>;

export const reviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, 'Tap the stars to choose a rating')
    .max(5, 'Ratings go up to 5 stars'),
  comment: z.string().trim().max(500, 'Comment must be 500 characters or fewer'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
