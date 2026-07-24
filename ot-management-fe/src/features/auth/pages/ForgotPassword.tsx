'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Form } from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import { AppFormInput } from '@/shared/components/custome';
import { notify } from '@/shared/utils/notify';
import { getErrorMessage } from '@/shared/utils/api-error';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/features/auth/schemas/auth.schema';
import { useForgotPassword } from '@/features/auth/hooks';

export default function ForgotPassword() {
  const router = useRouter();
  const forgot = useForgotPassword();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await forgot.mutateAsync(values);
      notify({
        type: 'success',
        title: 'Verification code sent',
        description: 'Check your inbox for the 6-digit code.',
      });
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      notify({ type: 'error', title: 'Request failed', description: getErrorMessage(error) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a code to reset your password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <AppFormInput control={form.control} name="email" label="Email" placeholder="you@company.com" type="email" />
          <Button type="submit" className="w-full" disabled={forgot.isPending}>
            {forgot.isPending && <Loader2 className="size-4 animate-spin" />}
            Send reset code
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
