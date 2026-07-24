import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const ALLOWED_SIGNUP_EMAILS = [
  'hieutc@v-takeuchi.vn',
  'phucnnq@v-takeuchi.vn',
  'minhpq@v-takeuchi.vn',
  'quihn@v-takeuchi.vn',
  'thaind@v-takeuchi.vn',
  'tinhpt@v-takeuchi.vn',
  'anntt@v-takeuchi.vn',
  'hiepnd@v-takeuchi.vn',
  'hungtt@v-takeuchi.vn',
  'thongdn@v-takeuchi.vn',
  'khiemth@v-takeuchi.vn',
  'phamdanh@v-takeuchi.vn',
];

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email')
    .refine((value) => ALLOWED_SIGNUP_EMAILS.includes(value.trim().toLowerCase()), {
      message: 'bạn không thuộc teamIT bạn đừng mơ sử dụng web này hehehe',
    }),
  password: z.string().min(6, 'Password must be at least 6 characters').max(64),
});

export const signupOtpSchema = z.object({
  otp: z.string().length(6, 'Nhập đủ 6 số'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    otp: z.string().length(6, 'Enter the 6-digit code'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters').max(64),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type SignupOtpValues = z.infer<typeof signupOtpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
