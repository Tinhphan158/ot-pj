export const IS_PUBLIC_API_KEY = 'isPublic';

export const ERRORS = {
  BASE_ERROR: {
    statusCode: 400,
    errorCode: 'BASE_ERROR',
  },
} as const;

export const OTP = {
  TTL_MS: 5 * 60 * 1000,
  LENGTH: 6,
  CACHE_PREFIX: 'otp:',
} as const;
