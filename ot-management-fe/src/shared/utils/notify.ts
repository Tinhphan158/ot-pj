import { toast } from 'sonner';

type NotifyType = 'success' | 'error' | 'info' | 'warning';

interface NotifyOptions {
  type?: NotifyType;
  title: string;
  description?: string;
}

export function notify({ type = 'info', title, description }: NotifyOptions) {
  toast[type](title, description ? { description } : undefined);
}
