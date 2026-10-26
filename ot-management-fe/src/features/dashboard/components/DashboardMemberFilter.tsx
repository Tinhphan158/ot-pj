'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Search, UserRound, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { cn } from '@/shared/utils/cn';
import { OvertimeUserAvatar } from '@/features/overtime/components/OvertimeUserAvatar';
import { useUsersQuery } from '@/features/dashboard/hooks/queries/useUsersQuery';

interface DashboardMemberFilterProps {
  /** The member being looked at; undefined means the signed-in user. */
  value?: string;
  currentUserId?: string;
  onChange: (userId: string | undefined) => void;
}

/** Searchable picker that points the personal section and the trend at one member. */
export function DashboardMemberFilter({ value, currentUserId, onChange }: DashboardMemberFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: users = [], isLoading } = useUsersQuery();

  const selected = users.find((user) => user.id === value);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term));
  }, [users, search]);

  const pick = (userId: string | undefined) => {
    // Picking yourself is the same as clearing the filter.
    onChange(userId === currentUserId ? undefined : userId);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="min-w-[200px] justify-between font-normal">
            <span className="flex min-w-0 items-center gap-2">
              <UserRound className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{selected ? selected.name : 'Me'}</span>
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72">
          <div className="flex items-center gap-2 border-b px-3">
            <Search className="size-4 text-muted-foreground" />
            <Input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              className="h-9 border-0 px-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto p-1" role="listbox">
            {isLoading ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">Loading…</li>
            ) : filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">No member found.</li>
            ) : (
              filtered.map((user) => {
                const active = (value ?? currentUserId) === user.id;
                return (
                  <li key={user.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => pick(user.id)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                    >
                      <OvertimeUserAvatar userId={user.id} name={user.name} avatarUrl={user.avatar} className="size-7" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {user.name}
                          {user.id === currentUserId && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                      </span>
                      <Check className={cn('size-4 shrink-0', active ? 'opacity-100' : 'opacity-0')} />
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </PopoverContent>
      </Popover>
      {value && (
        <Button variant="ghost" size="icon" className="size-8" onClick={() => pick(undefined)} aria-label="Back to my numbers">
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
