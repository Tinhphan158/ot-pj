import { http } from '@/lib/http';
import { API_PATHS } from '@/shared/api/constants/api-paths';
import type { AuthResponse, MessageResponse } from '@/shared/api/types';

export interface RequestSignupOtpPayload {
  email: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  name: string;
  otp: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export const authService = {
  requestSignupOtp: (payload: RequestSignupOtpPayload) =>
    http.post<MessageResponse>(API_PATHS.AUTH.SIGNUP_REQUEST_OTP, payload),
  signup: (payload: SignupPayload) => http.post<AuthResponse>(API_PATHS.AUTH.SIGNUP, payload),
  login: (payload: LoginPayload) => http.post<AuthResponse>(API_PATHS.AUTH.LOGIN, payload),
  logout: () => http.post<MessageResponse>(API_PATHS.AUTH.LOGOUT),
  forgotPassword: (payload: ForgotPasswordPayload) =>
    http.post<MessageResponse>(API_PATHS.AUTH.FORGOT_PASSWORD, payload),
  verifyOtp: (payload: VerifyOtpPayload) => http.post<MessageResponse>(API_PATHS.AUTH.VERIFY_OTP, payload),
  resetPassword: (payload: ResetPasswordPayload) => http.post<MessageResponse>(API_PATHS.AUTH.RESET_PASSWORD, payload),
};
