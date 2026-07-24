import { http } from '@/lib/http';
import { API_PATHS } from '@/shared/api/constants/api-paths';
import type { MessageResponse, User } from '@/shared/api/types';

export interface UpdateProfilePayload {
  name: string;
  avatar?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  getMe: () => http.get<User>(API_PATHS.USERS.ME),
  updateProfile: (payload: UpdateProfilePayload) => http.patch<User>(API_PATHS.USERS.ME, payload),
  changePassword: (payload: ChangePasswordPayload) =>
    http.patch<MessageResponse>(API_PATHS.USERS.ME_PASSWORD, payload),
};
