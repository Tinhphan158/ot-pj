'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { ImageIcon, LogOut, Moon, Sun, User as UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { AvatarPreviewDialog } from '@/shared/components/custome/AvatarViewer';
import { getInitials } from '@/shared/utils/format';
import { userColor } from '@/shared/utils/userColor';
import type { User } from '@/shared/api/types';
import { useLogout } from '@/features/auth/hooks/mutations/useLogout';

export function AppUserMenu({ user }: { user: User }) {
  const { theme, setTheme } = useTheme();
  const { logout } = useLogout();
  const [avatarOpen, setAvatarOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="size-9 border-2" style={{ borderColor: userColor(user.id) }}>
            {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
            <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* This avatar is the menu trigger, so the lightbox gets its own item
              rather than stealing the click that opens the menu. */}
          {user.avatar && (
            <DropdownMenuItem onClick={() => setAvatarOpen(true)}>
              <ImageIcon className="size-4" />
              View avatar
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            Toggle theme
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/profile" className="flex items-center gap-2">
              <UserIcon className="size-4" />
              Profile
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => void logout()}>
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AvatarPreviewDialog
        src={user.avatar}
        name={user.name}
        open={avatarOpen}
        onOpenChange={setAvatarOpen}
      />
    </>
  );
}
