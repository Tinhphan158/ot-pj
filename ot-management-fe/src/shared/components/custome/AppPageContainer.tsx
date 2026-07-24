import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

export function AppPageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full px-4 py-6 sm:px-20 lg:py-8', className)}>{children}</div>;
}

interface AppPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function AppPageHeader({ title, description, actions }: AppPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
