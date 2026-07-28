'use client';

import { useState, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { cn } from '@/shared/utils/cn';

interface AvatarPreviewDialogProps {
  src?: string | null;
  /** Whose avatar it is — used for the dialog title and the alt text. */
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Lightbox for a full-size avatar. Controlled, so it also works where the avatar
 * itself cannot own the click — the header avatar, for instance, is a dropdown
 * trigger and opens this from a menu item instead.
 */
export function AvatarPreviewDialog({ src, name, open, onOpenChange }: AvatarPreviewDialogProps) {
  if (!src) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-3">
        <DialogHeader>
          <DialogTitle className="truncate pr-6">{name}</DialogTitle>
          <DialogDescription>Avatar</DialogDescription>
        </DialogHeader>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${name}'s avatar`}
          className="max-h-[70vh] w-full rounded-lg bg-muted object-contain"
        />
      </DialogContent>
    </Dialog>
  );
}

interface AvatarViewerProps {
  /** Image to enlarge. When absent the avatar renders untouched and stays inert. */
  src?: string | null;
  name: string;
  /** The avatar as it appears inline. */
  children: ReactNode;
  className?: string;
}

/**
 * Makes an avatar open a lightbox of the full image on click.
 *
 * Wraps rather than replaces the avatar so every existing avatar keeps its own
 * size and styling. Users with no uploaded image fall through unwrapped: their
 * avatar is generated initials, so there is nothing to enlarge and a dead button
 * would only invite a pointless click.
 */
export function AvatarViewer({ src, name, children, className }: AvatarViewerProps) {
  const [open, setOpen] = useState(false);

  if (!src) return <>{children}</>;

  return (
    <>
      <button
        type="button"
        // Avatars sit inside clickable rows and OT bars, so keep the click here.
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          'flex shrink-0 cursor-zoom-in rounded-full transition-opacity hover:opacity-80',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
          className,
        )}
        aria-label={`View ${name}'s avatar`}
      >
        {children}
      </button>

      <AvatarPreviewDialog src={src} name={name} open={open} onOpenChange={setOpen} />
    </>
  );
}
