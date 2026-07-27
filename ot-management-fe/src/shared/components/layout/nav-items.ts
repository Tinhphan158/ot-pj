import { CalendarRange, LayoutDashboard, UserRound, type LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Overtime management', href: '/team-overtime', icon: CalendarRange },
  { label: 'Hồ sơ', href: '/profile', icon: UserRound },
];
