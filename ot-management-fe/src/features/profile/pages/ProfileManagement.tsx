'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { AppPageContainer, AppPageHeader, AppFormInput, AppFormPasswordInput } from '@/shared/components/custome';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Form } from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import { getInitials } from '@/shared/utils/format';
import { userColor } from '@/shared/utils/userColor';
import { notify } from '@/shared/utils/notify';
import { getErrorMessage } from '@/shared/utils/api-error';
import { useCurrentUser } from '@/features/auth/store/auth.store';
import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordValues,
  type UpdateProfileValues,
} from '@/features/profile/schemas/profile.schema';
import { useUpdateProfile } from '@/features/profile/hooks/mutations/useUpdateProfile';
import { useChangePassword } from '@/features/profile/hooks/mutations/useChangePassword';

export default function ProfileManagement() {
  const user = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileForm = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    values: { name: user?.name ?? '', avatar: user?.avatar ?? '' },
  });

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const namePreview = profileForm.watch('name');
  const avatarPreview = profileForm.watch('avatar');
  const borderColor = user ? userColor(user.id) : undefined;

  const onSaveProfile = async (values: UpdateProfileValues) => {
    try {
      await updateProfile.mutateAsync({ name: values.name, avatar: values.avatar || undefined });
      notify({ type: 'success', title: 'Đã cập nhật hồ sơ' });
    } catch (error) {
      notify({ type: 'error', title: 'Không thể cập nhật hồ sơ', description: getErrorMessage(error) });
    }
  };

  const onChangePassword = async (values: ChangePasswordValues) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      notify({ type: 'success', title: 'Đã đổi mật khẩu' });
      passwordForm.reset();
    } catch (error) {
      notify({ type: 'error', title: 'Không thể đổi mật khẩu', description: getErrorMessage(error) });
    }
  };

  return (
    <AppPageContainer className="max-w-3xl">
      <AppPageHeader title="Hồ sơ" description="Cập nhật thông tin cá nhân và mật khẩu của bạn." />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>Họ tên và ảnh đại diện hiển thị trong ứng dụng.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-5 flex items-center gap-4">
              <Avatar className="size-16 border-2" style={{ borderColor }}>
                {avatarPreview ? <AvatarImage src={avatarPreview} alt={namePreview} /> : null}
                <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">
                  {getInitials(namePreview || user?.name || '?')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{namePreview || user?.name}</p>
                <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                <AppFormInput control={profileForm.control} name="name" label="Họ và tên" placeholder="Nguyễn Văn A" />
                <AppFormInput
                  control={profileForm.control}
                  name="avatar"
                  label="Ảnh đại diện (URL)"
                  placeholder="https://…"
                  description="Dán link ảnh. Để trống nếu muốn dùng chữ viết tắt."
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending && <Loader2 className="size-4 animate-spin" />}
                    Lưu thay đổi
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đổi mật khẩu</CardTitle>
            <CardDescription>Nhập mật khẩu hiện tại và mật khẩu mới.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                <AppFormPasswordInput
                  control={passwordForm.control}
                  name="currentPassword"
                  label="Mật khẩu hiện tại"
                  placeholder="••••••••"
                />
                <AppFormPasswordInput
                  control={passwordForm.control}
                  name="newPassword"
                  label="Mật khẩu mới"
                  placeholder="Tối thiểu 6 ký tự"
                />
                <AppFormPasswordInput
                  control={passwordForm.control}
                  name="confirmPassword"
                  label="Xác nhận mật khẩu mới"
                  placeholder="Nhập lại mật khẩu mới"
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={changePassword.isPending}>
                    {changePassword.isPending && <Loader2 className="size-4 animate-spin" />}
                    Đổi mật khẩu
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppPageContainer>
  );
}
