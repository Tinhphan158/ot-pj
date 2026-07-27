export const IS_PUBLIC_API_KEY = 'isPublic';

export const ERRORS = {
  BASE_ERROR: {
    statusCode: 400,
    errorCode: 'BASE_ERROR',
  },
} as const;

export const OVERTIME = {
  /** Company-wide quota: overtime records everyone combined may register on one day. */
  MAX_ENTRIES_PER_DAY: 5,
} as const;

export const OTP = {
  TTL_MS: 5 * 60 * 1000,
  LENGTH: 6,
  CACHE_PREFIX: 'otp:',
} as const;
