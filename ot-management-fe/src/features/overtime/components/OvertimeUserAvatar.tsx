import { cn } from '@/shared/utils/cn';
import { getInitials } from '@/shared/utils/format';
import { userColor } from '@/features/overtime/utils/userColor';

interface OvertimeUserAvatarProps {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  className?: string;
}

/**
 * Round avatar bordered with the user's OT color. Shows the uploaded image when
 * available, otherwise white initials on the color fill.
 */
export function OvertimeUserAvatar({ userId, name, avatarUrl, className }: OvertimeUserAvatarProps) {
  const color = userColor(userId);
  return (
    <span
      className={cn(
        'flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-[11px] font-semibold text-white',
        className,
      )}
      style={{ borderColor: color, backgroundColor: color }}
      title={name}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} className="size-full rounded-full object-cover" />
      ) : (
        getInitials(name || '?')
      )}
    </span>
  );
}
