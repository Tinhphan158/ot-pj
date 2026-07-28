'use client';

import { useState, type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { useCurrentUser, useHasAuthHydrated } from '@/features/auth/store/auth.store';
import { NAV_ITEMS } from './nav-items';
import { AppSidebarNav, SidebarBrand } from './AppSidebarNav';
import { AppUserMenu } from './AppUserMenu';

export function AppMainLayout({ children }: { children: ReactNode }) {
  const hydrated = useHasAuthHydrated();
  const user = useCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = NAV_ITEMS;

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // The shell stays translucent so the cosmic backdrop reads through it.
  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-sidebar/70 px-3 py-4 backdrop-blur-xl lg:flex">
        <SidebarBrand />
        <div className="mt-6 flex-1">
          <AppSidebarNav items={navItems} />
        </div>
        <p className="px-3 text-xs text-muted-foreground">Release on 21/07/2026 by TinhPhan</p>
        <p className="px-3 text-xs text-muted-foreground">v0.1.0</p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b bg-background/60 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-sidebar/90 p-3 backdrop-blur-xl">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarBrand />
                <div className="mt-6">
                  <AppSidebarNav items={navItems} onNavigate={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            )}
            {user && <AppUserMenu user={user} />}
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
