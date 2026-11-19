'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useHasAuthHydrated, useIsAuthenticated } from '@/features/auth/store/auth.store';
import { removeAccessTokenCookie } from '@/shared/utils/auth-cookie';

/** Gate that only requires an authenticated session (no role distinction). */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hydrated = useHasAuthHydrated();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      // Drop the gate cookie first; otherwise the proxy bounces /login straight
      // back here and the page spins forever.
      removeAccessTokenCookie();
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
