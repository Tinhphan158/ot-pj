export const API_PATHS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_OTP: '/auth/verify-otp',
    RESET_PASSWORD: '/auth/reset-password',
  },
  OVERTIMES: {
    BASE: '/overtimes',
    RANGE: '/overtimes/range',
    DETAIL: (id: string) => `/overtimes/${id}`,
  },
  USERS: {
    ME: '/users/me',
    ME_PASSWORD: '/users/me/password',
  },
} as const;
