'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { isPayday } from '@/shared/utils/payday';
import { toDateStr } from '@/features/overtime/utils/period';

const SEEN_KEY_PREFIX = 'payday-dialog-seen';
const MONEY = ['💸', '💵', '💰', '🪙', '💴', '💶', '💷', '💵', '💸'];
/** Drops in the opening downpour (short delays) vs. the steady rain that follows. */
const BURST_DROPS = 35;
const STEADY_DROPS = 40;

interface Drop {
  emoji: string;
  style: CSSProperties;
}

const random = (min: number, max: number) => min + Math.random() * (max - min);

function makeDrops(): Drop[] {
  return Array.from({ length: BURST_DROPS + STEADY_DROPS }, (_, i) => {
    const burst = i < BURST_DROPS;
    return {
      emoji: MONEY[Math.floor(Math.random() * MONEY.length)],
      style: {
        '--x': `${random(-2, 98)}vw`,
        '--drift': `${random(-15, 15)}vw`,
        '--spin': `${random(-540, 540)}deg`,
        '--duration': `${random(2.6, 5.2)}s`,
        '--delay': `${burst ? random(0, 1) : random(1, 5)}s`,
        '--flutter': `${random(0.4, 0.9)}s`,
        fontSize: `${random(22, 48)}px`,
      } as CSSProperties,
    };
  });
}

/**
 * Full-screen money rain over the whole page. Portaled to <body> above the
 * dialog (z-60) and click-through, so it never blocks the buttons.
 */
function MoneyRain() {
  // Randomised once per opening; this only mounts client-side while the dialog is open.
  const [drops] = useState(makeDrops);
  return createPortal(
    <div aria-hidden className="money-rain pointer-events-none fixed inset-0 z-60 overflow-hidden">
      {drops.map((drop, i) => (
        <span key={i} className="money-rain-drop" style={drop.style}>
          <span>{drop.emoji}</span>
        </span>
      ))}
    </div>,
    document.body,
  );
}

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

  return <PaydayDialog open={open} onOpenChange={setOpen} />;
}

/** The payday celebration itself, controlled — also opened from a payday in the lunar calendar. */
export function PaydayDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="light max-w-[calc(100%-2rem)] overflow-hidden bg-background text-center text-foreground scheme-light sm:max-w-xl">
        {open && <MoneyRain />}

        <DialogHeader className="relative items-center sm:text-center">
          <DialogTitle className="text-3xl font-bold">Hôm nay lúa về! 🌾</DialogTitle>
          <DialogDescription className="text-lg font-semibold text-foreground">Bank account ting ting...! 🔔💰</DialogDescription>
        </DialogHeader>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/memes/payday-cat.gif"
          alt="Mèo nhảy múa mừng ngày lương"
          // As large as the dialog allows, but capped by viewport height so it never overflows.
          className="relative mx-auto aspect-square w-full max-w-[55vh] rounded-2xl object-cover shadow-lg"
        />

        <p className="relative text-base font-semibold text-foreground">Chúc mừng ngày lương — tháng này vất vả rồi!</p>

        <Button className="relative w-full" onClick={() => onOpenChange(false)}>
          Tuyệt vời 🎉
        </Button>
      </DialogContent>
    </Dialog>
  );
}
