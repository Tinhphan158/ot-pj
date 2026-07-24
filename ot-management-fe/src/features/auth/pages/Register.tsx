'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Form } from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { AppFormInput, AppFormPasswordInput } from '@/shared/components/custome';
import { notify } from '@/shared/utils/notify';
import { getErrorMessage } from '@/shared/utils/api-error';
import {
  registerSchema,
  signupOtpSchema,
  type RegisterValues,
  type SignupOtpValues,
} from '@/features/auth/schemas/auth.schema';
import { useRegister, useRequestSignupOtp } from '@/features/auth/hooks';

export default function Register() {
  const router = useRouter();
  const requestOtp = useRequestSignupOtp();
  const register = useRegister();

  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [info, setInfo] = useState<RegisterValues | null>(null);

  const infoForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onSubmit',
  });

  const otpForm = useForm<SignupOtpValues>({
    resolver: zodResolver(signupOtpSchema),
    defaultValues: { otp: '' },
    mode: 'onSubmit',
  });

  const onRequestOtp = async (values: RegisterValues) => {
    try {
      await requestOtp.mutateAsync({ email: values.email });
      setInfo(values);
      setStep('otp');
      otpForm.reset({ otp: '' });
      notify({ type: 'success', title: 'Đã gửi mã xác thực', description: `Kiểm tra hộp thư ${values.email}` });
    } catch (error) {
      notify({ type: 'error', title: 'Không gửi được mã', description: getErrorMessage(error) });
    }
  };

  const onVerifyAndRegister = async (values: SignupOtpValues) => {
    if (!info) return;
    try {
      await register.mutateAsync({
        name: info.name,
        email: info.email,
        password: info.password,
        otp: values.otp,
      });
      notify({ type: 'success', title: 'Tạo tài khoản thành công', description: 'Vui lòng đăng nhập để tiếp tục.' });
      router.replace('/login');
    } catch (error) {
      notify({ type: 'error', title: 'Xác thực thất bại', description: getErrorMessage(error) });
    }
  };

  const resendOtp = async () => {
    if (!info) return;
    try {
      await requestOtp.mutateAsync({ email: info.email });
      notify({ type: 'success', title: 'Đã gửi lại mã xác thực' });
    } catch (error) {
      notify({ type: 'error', title: 'Không gửi được mã', description: getErrorMessage(error) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground">
          {step === 'info'
            ? 'Đăng ký bằng email công ty @v-takeuchi.vn. Chỉ hỗ trợ cho team IT'
            : `Nhập mã 6 số đã gửi tới ${info?.email}.`}
        </p>
      </div>

      {step === 'info' ? (
        <Form {...infoForm}>
          <form onSubmit={infoForm.handleSubmit(onRequestOtp)} className="space-y-4">
            <AppFormInput control={infoForm.control} name="name" label="Full name" placeholder="Nguyen Van A" />
            <AppFormInput
              control={infoForm.control}
              name="email"
              label="Email"
              placeholder="you@v-takeuchi.vn"
              type="email"
            />
            <AppFormPasswordInput
              control={infoForm.control}
              name="password"
              label="Password"
              placeholder="At least 6 characters"
            />

            <Button type="submit" className="w-full" disabled={requestOtp.isPending}>
              {requestOtp.isPending && <Loader2 className="size-4 animate-spin" />}
              Gửi mã xác thực
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onVerifyAndRegister)} className="space-y-4">
            <Controller
              control={otpForm.control}
              name="otp"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor="otp">Mã xác thực (OTP)</Label>
                  <Input
                    id="otp"
                    autoFocus
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="6 chữ số"
                    className="text-center text-lg tracking-[0.5em]"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    onBlur={field.onBlur}
                  />
                  {fieldState.error && (
                    <p className="text-sm text-destructive">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />

            <Button type="submit" className="w-full" disabled={register.isPending}>
              {register.isPending && <Loader2 className="size-4 animate-spin" />}
              Tạo tài khoản
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setStep('info')}
                className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Quay lại
              </button>
              <button
                type="button"
                onClick={resendOtp}
                disabled={requestOtp.isPending}
                className="font-medium text-primary hover:underline disabled:opacity-50"
              >
                Gửi lại mã
              </button>
            </div>
          </form>
        </Form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
