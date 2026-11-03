'use client';

import { useRef, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import {
  AppPageContainer,
  AppPageHeader,
  AppFormInput,
  AppFormPasswordInput,
  AvatarViewer,
} from '@/shared/components/custome';
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
  AVATAR_MAX_BYTES,
  AVATAR_MIME_TYPES,
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordValues,
  type UpdateProfileValues,
} from '@/features/profile/schemas/profile.schema';
import { useUpdateProfile } from '@/features/profile/hooks/mutations/useUpdateProfile';
import { useChangePassword } from '@/features/profile/hooks/mutations/useChangePassword';
import { useUploadAvatar } from '@/features/profile/hooks/mutations/useUploadAvatar';

export default function ProfileManagement() {
  const user = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    values: { name: user?.name ?? '' },
  });

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const namePreview = profileForm.watch('name');
  const avatarUrl = user?.avatar ?? null;
  const avatarBusy = uploadAvatar.isPending || removeAvatar.isPending;
  const borderColor = user ? userColor(user.id) : undefined;

  const onSaveProfile = async (values: UpdateProfileValues) => {
    try {
      // Avatar is managed by its own buttons; leaving it out keeps the current one.
      await updateProfile.mutateAsync({ name: values.name });
      notify({ type: 'success', title: 'Profile updated' });
    } catch (error) {
      notify({ type: 'error', title: 'Could not update profile', description: getErrorMessage(error) });
    }
  };

  const onPickAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so picking the same file again still fires a change.
    event.target.value = '';
    if (!file) return;

    if (!AVATAR_MIME_TYPES.includes(file.type)) {
      notify({ type: 'error', title: 'Unsupported image', description: 'Use a JPG, PNG, WEBP or GIF file.' });
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      notify({ type: 'error', title: 'Image too large', description: 'The image must be 5 MB or smaller.' });
      return;
    }

    try {
      await uploadAvatar.mutateAsync(file);
      notify({ type: 'success', title: 'Avatar updated' });
    } catch (error) {
      notify({ type: 'error', title: 'Could not upload avatar', description: getErrorMessage(error) });
    }
  };

  const onRemoveAvatar = async () => {
    if (!user) return;
    try {
      await removeAvatar.mutateAsync({ name: user.name, avatar: '' });
      notify({ type: 'success', title: 'Avatar removed' });
    } catch (error) {
      notify({ type: 'error', title: 'Could not remove avatar', description: getErrorMessage(error) });
    }
  };

  const onChangePassword = async (values: ChangePasswordValues) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      notify({ type: 'success', title: 'Password changed' });
      passwordForm.reset();
    } catch (error) {
      notify({ type: 'error', title: 'Could not change password', description: getErrorMessage(error) });
    }
  };

  return (
    <AppPageContainer className="max-w-3xl">
      <AppPageHeader title="Profile" description="Update your personal details and password." />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>The name and avatar shown across the app.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="relative shrink-0">
                  <AvatarViewer src={avatarUrl} name={namePreview || user?.name || 'Avatar'}>
                    <Avatar className="size-16 border-2" style={{ borderColor }}>
                      {avatarUrl ? <AvatarImage src={avatarUrl} alt={namePreview} /> : null}
                      <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">
                        {getInitials(namePreview || user?.name || '?')}
                      </AvatarFallback>
                    </Avatar>
                  </AvatarViewer>
                  {avatarBusy && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
                      <Loader2 className="size-5 animate-spin" />
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{namePreview || user?.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 sm:items-end">
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={AVATAR_MIME_TYPES.join(',')}
                    className="hidden"
                    onChange={onPickAvatar}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={avatarBusy}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="size-4" />
                    {avatarUrl ? 'Change photo' : 'Upload photo'}
                  </Button>
                  {avatarUrl && (
                    <Button type="button" variant="ghost" size="sm" disabled={avatarBusy} onClick={onRemoveAvatar}>
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">JPG, PNG, WEBP or GIF · up to 5 MB</p>
              </div>
            </div>

            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                <AppFormInput control={profileForm.control} name="name" label="Full name" placeholder="Nguyen Van A" />
                <div className="flex justify-end">
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending && <Loader2 className="size-4 animate-spin" />}
                    Save changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>Enter your current password and the new one.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                <AppFormPasswordInput
                  control={passwordForm.control}
                  name="currentPassword"
                  label="Current password"
                  placeholder="••••••••"
                />
                <AppFormPasswordInput
                  control={passwordForm.control}
                  name="newPassword"
                  label="New password"
                  placeholder="At least 6 characters"
                />
                <AppFormPasswordInput
                  control={passwordForm.control}
                  name="confirmPassword"
                  label="Confirm new password"
                  placeholder="Re-enter the new password"
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={changePassword.isPending}>
                    {changePassword.isPending && <Loader2 className="size-4 animate-spin" />}
                    Change password
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
