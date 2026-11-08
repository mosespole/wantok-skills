import { z } from 'zod';

import { CATEGORY_IDS } from '@/constants/categories';
import type { ServiceInput } from '@/types/service';

import { toLocalPhoneDigits } from './formatting';

const email = z.string().trim().min(1, 'validation.emailRequired').email('validation.emailInvalid');

// PNG mobiles have 8 digits (starting with 7); landlines have 7 digits.
export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'validation.phoneRequired')
  .refine((value) => /^[\d\s+()-]+$/.test(value), 'validation.phoneDigits')
  .refine((value) => {
    const local = toLocalPhoneDigits(value);
    return local.length === 7 || local.length === 8;
  }, 'validation.phoneInvalid');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'validation.passwordRequired'),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'validation.nameRequired').max(60, 'validation.nameTooLong'),
    email,
    phoneNumber: phoneSchema,
    role: z.enum(['customer', 'provider'], { message: 'validation.roleRequired' }),
    password: z
      .string()
      .min(8, 'validation.passwordShort')
      .regex(/[A-Za-z]/, 'validation.passwordLetter')
      .regex(/\d/, 'validation.passwordNumber'),
    confirmPassword: z.string().min(1, 'validation.confirmRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'validation.passwordMismatch',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({ email });

const MAX_PRICE = 1_000_000;

/**
 * Create/Edit listing form. Price is typed as text so the field can be left
 * empty; `toServiceInput` converts it to a number (or null) before saving.
 */
export const serviceSchema = z.object({
  title: z.string().trim().min(3, 'validation.titleShort').max(80, 'validation.titleLong'),
  category: z.enum(CATEGORY_IDS, { message: 'validation.categoryRequired' }),
  description: z
    .string()
    .trim()
    .min(10, 'validation.descriptionShort')
    .max(1000, 'validation.descriptionLong'),
  locationName: z
    .string()
    .trim()
    .min(2, 'validation.locationRequired')
    .max(100, 'validation.locationLong'),
  contactNumber: phoneSchema,
  startingPrice: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d+(\.\d{1,2})?$/.test(value), 'validation.priceInvalid')
    .refine((value) => value === '' || Number(value) <= MAX_PRICE, 'validation.priceMax'),
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
  fullName: z.string().trim().min(2, 'validation.nameRequired').max(60, 'validation.nameTooLong'),
  phoneNumber: phoneSchema,
  bio: z.string().trim().max(500, 'validation.bioLong'),
  // '' means "not set"; customers never set a skill.
  skillCategory: z.union([z.enum(CATEGORY_IDS), z.literal('')]),
  locationName: z.string().trim().max(100, 'validation.locationLong'),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

/** Add/Edit past work. The photo is handled separately (it is picked and compressed, not typed). */
export const portfolioSchema = z.object({
  caption: z.string().trim().min(3, 'validation.captionShort').max(120, 'validation.captionLong'),
  category: z.enum(CATEGORY_IDS, { message: 'validation.categoryRequired' }),
  locationName: z.string().trim().max(100, 'validation.locationLong'),
  completedAt: z
    .date({ message: 'validation.dateRequired' })
    // Checked against the current time on every submit (allowing for time zones).
    .refine((date) => date.getTime() <= Date.now() + 24 * 60 * 60 * 1000, {
      message: 'validation.dateFuture',
    }),
});

export type PortfolioFormValues = z.infer<typeof portfolioSchema>;

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'validation.ratingRequired').max(5, 'validation.ratingMax'),
  comment: z.string().trim().max(500, 'validation.commentLong'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
