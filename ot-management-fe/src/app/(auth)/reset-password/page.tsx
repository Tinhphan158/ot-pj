import { Suspense } from 'react';
import ResetPassword from '@/features/auth/pages/ResetPassword';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}
