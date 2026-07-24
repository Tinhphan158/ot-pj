'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Form } from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import { AppFormInput, AppFormPasswordInput } from '@/shared/components/custome';
import { notify } from '@/shared/utils/notify';
import { getErrorMessage } from '@/shared/utils/api-error';
import { resetPasswordSchema, type ResetPasswordValues } from '@/features/auth/schemas/auth.schema';
import { useResetPassword } from '@/features/auth/hooks';

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reset = useResetPassword();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '', otp: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    const email = searchParams.get('email');
    if (email) form.setValue('email', email);
  }, [searchParams, form]);

  const onSubmit = async (values: ResetPasswordValues) => {
    try {
      await reset.mutateAsync({ email: values.email, otp: values.otp, newPassword: values.newPassword });
      notify({ type: 'success', title: 'Password updated', description: 'You can now sign in with your new password.' });
      router.replace('/login');
    } catch (error) {
      notify({ type: 'error', title: 'Reset failed', description: getErrorMessage(error) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
        <p className="text-sm text-muted-foreground">Enter the code we sent and choose a new password.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <AppFormInput control={form.control} name="email" label="Email" placeholder="you@company.com" type="email" />
          <AppFormInput control={form.control} name="otp" label="Verification code" placeholder="6-digit code" />
          <AppFormPasswordInput control={form.control} name="newPassword" label="New password" placeholder="At least 6 characters" />
          <AppFormPasswordInput control={form.control} name="confirmPassword" label="Confirm password" placeholder="Re-enter password" />
          <Button type="submit" className="w-full" disabled={reset.isPending}>
            {reset.isPending && <Loader2 className="size-4 animate-spin" />}
            Reset password
          </Button>
        </form>
      </Form>

      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to sign in
      </Link>
    </div>
  );
}
