import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Please enter your full name').max(120),
});

/** Mirrors the server's avatar rules (`POST /users/me/avatar`). */
export const AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters').max(64),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
