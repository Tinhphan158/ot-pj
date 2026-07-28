import { toast } from 'sonner';

type NotifyType = 'success' | 'error' | 'info' | 'warning';

interface NotifyOptions {
  type?: NotifyType;
  title: string;
  description?: string;
}

/**
 * Prefix that carries a toast's id into its DOM class list.
 *
 * Sonner has no click-to-dismiss and does not expose the id in the DOM, so the
 * Toaster cannot tell which toast was clicked — and `toast.dismiss()` with no id
 * clears all of them. Supplying our own id and echoing it in a class gives the
 * Toaster something to read back. See `ui/sonner.tsx`.
 */
export const TOAST_ID_CLASS_PREFIX = 'toast-id-';

let sequence = 0;

export function notify({ type = 'info', title, description }: NotifyOptions) {
  const id = `notify-${++sequence}`;

  toast[type](title, {
    id,
    className: `${TOAST_ID_CLASS_PREFIX}${id}`,
    ...(description ? { description } : {}),
  });

  return id;
}
