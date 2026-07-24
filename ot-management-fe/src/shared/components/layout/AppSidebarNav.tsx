'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { NavItem } from './nav-items';

interface AppSidebarNavProps {
  items: NavItem[];
  onNavigate?: () => void;
}

export function SidebarBrand() {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1">
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Clock className="size-5" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold">OT Management</p>
        <p className="text-xs text-muted-foreground">Overtime tracker</p>
      </div>
    </div>
  );
}

export function AppSidebarNav({ items, onNavigate }: AppSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
