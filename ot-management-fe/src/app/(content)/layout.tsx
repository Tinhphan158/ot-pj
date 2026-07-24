import type { ReactNode } from 'react';
import { AppMainLayout } from '@/shared/components/layout/AppMainLayout';

export default function ContentLayout({ children }: { children: ReactNode }) {
  return <AppMainLayout>{children}</AppMainLayout>;
}
