'use client';

import { useMutation } from '@tanstack/react-query';
import { userService } from '@/shared/api';
import { useAuthStore } from '@/features/auth/store/auth.store';

export function useUploadAvatar() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: (user) => {
      // Keep the header/menu in sync with the new avatar.
      setUser(user);
    },
  });
}
