'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Form } from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import { AppFormInput, AppFormPasswordInput } from '@/shared/components/custome';
import { notify } from '@/shared/utils/notify';
import { getErrorMessage } from '@/shared/utils/api-error';
import { loginSchema, type LoginValues } from '@/features/auth/schemas/auth.schema';
import { useLogin } from '@/features/auth/hooks';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      await login.mutateAsync(values);
      notify({ type: 'success', title: 'Welcome back!' });
      const redirect = searchParams.get('redirect') || '/team-overtime';
      router.replace(redirect);
    } catch (error) {
      notify({ type: 'error', title: 'Sign in failed', description: getErrorMessage(error) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">Enter your credentials to access your account.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <AppFormInput control={form.control} name="email" label="Email" placeholder="you@company.com" type="email" />
          <AppFormPasswordInput control={form.control} name="password" label="Password" placeholder="••••••••" />

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending && <Loader2 className="size-4 animate-spin" />}
            Sign in
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
