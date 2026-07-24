import type { User } from './user.type';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface MessageResponse {
  message: string;
}
