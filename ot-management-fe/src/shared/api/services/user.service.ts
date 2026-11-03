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
  findAll: () => http.get<User[]>(API_PATHS.USERS.BASE),
  getMe: () => http.get<User>(API_PATHS.USERS.ME),
  updateProfile: (payload: UpdateProfilePayload) => http.patch<User>(API_PATHS.USERS.ME, payload),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    // Overrides the instance's JSON default so axios sends the multipart body as-is.
    return http.post<User>(API_PATHS.USERS.ME_AVATAR, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  changePassword: (payload: ChangePasswordPayload) =>
    http.patch<MessageResponse>(API_PATHS.USERS.ME_PASSWORD, payload),
};
