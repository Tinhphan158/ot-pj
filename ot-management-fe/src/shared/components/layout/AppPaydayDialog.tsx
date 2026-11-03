'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { isPayday } from '@/shared/utils/payday';
import { toDateStr } from '@/features/overtime/utils/period';

const SEEN_KEY_PREFIX = 'payday-dialog-seen';
const MONEY = ['💸', '💰', '💵', '🪙', '💸', '💵', '💰', '🪙'];

/**
 * Celebrates payday once per user per day: the first visit on payday opens it,
 * later visits that day stay quiet.
 */
export function AppPaydayDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const today = new Date();
    if (!isPayday(today)) return;

    const key = `${SEEN_KEY_PREFIX}:${userId}:${toDateStr(today)}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, '1');
    } catch {
      // Storage blocked (private mode) — still celebrate, it just may repeat.
    }
    setOpen(true);
  }, [userId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm overflow-hidden text-center">
        {/* Falling money behind the content. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {MONEY.map((emoji, i) => (
            <span
              key={i}
              className="payday-money absolute -top-8 text-2xl"
              style={{ left: `${6 + i * 12}%`, animationDelay: `${(i % 4) * 0.6 + i * 0.15}s` }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <DialogHeader className="relative items-center sm:text-center">
          <DialogTitle className="text-2xl font-bold">Hôm nay lúa về! 🌾</DialogTitle>
          <DialogDescription className="text-base">Bank account ting ting...! 🔔💰</DialogDescription>
        </DialogHeader>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/memes/payday-cat.gif"
          alt="Mèo nhảy múa mừng ngày lương"
          className="relative mx-auto size-48 rounded-xl object-cover shadow-lg"
        />

        <p className="relative text-sm text-muted-foreground">Chúc mừng ngày lương — tháng này vất vả rồi!</p>

        <Button className="relative w-full" onClick={() => setOpen(false)}>
          Tuyệt vời 🎉
        </Button>
      </DialogContent>
    </Dialog>
  );
}
