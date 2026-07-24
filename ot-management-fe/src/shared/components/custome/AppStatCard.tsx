import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Card, CardContent } from '@/shared/components/ui/card';

interface AppStatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  accentClassName?: string;
}

export function AppStatCard({ label, value, hint, icon: Icon, accentClassName }: AppStatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 py-5">
        {Icon && (
          <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', accentClassName ?? 'bg-primary/10 text-primary')}>
            <Icon className="size-5" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
