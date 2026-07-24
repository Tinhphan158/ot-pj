'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Form } from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import { AppFormInput, AppFormPasswordInput } from '@/shared/components/custome';
import { notify } from '@/shared/utils/notify';
import { getErrorMessage } from '@/shared/utils/api-error';
import { registerSchema, type RegisterValues } from '@/features/auth/schemas/auth.schema';
import { useRegister } from '@/features/auth/hooks';

export default function Register() {
  const router = useRouter();
  const register = useRegister();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onSubmit',
  });

  const onSubmit = async (values: RegisterValues) => {
    try {
      await register.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      notify({ type: 'success', title: 'Account created', description: 'Welcome to OT Management!' });
      router.replace('/team-overtime');
    } catch (error) {
      notify({ type: 'error', title: 'Registration failed', description: getErrorMessage(error) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground">Register to start tracking your overtime.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <AppFormInput control={form.control} name="name" label="Full name" placeholder="Nguyen Van A" />
          <AppFormInput control={form.control} name="email" label="Email" placeholder="you@company.com" type="email" />
          <AppFormPasswordInput control={form.control} name="password" label="Password" placeholder="At least 6 characters" />

          <Button type="submit" className="w-full" disabled={register.isPending}>
            {register.isPending && <Loader2 className="size-4 animate-spin" />}
            Create account
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
