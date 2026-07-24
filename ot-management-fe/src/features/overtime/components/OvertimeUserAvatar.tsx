import { cn } from '@/shared/utils/cn';
import { getInitials } from '@/shared/utils/format';
import { userColor } from '@/features/overtime/utils/userColor';

interface OvertimeUserAvatarProps {
  userId: string;
  name: string;
  className?: string;
}

/** Round avatar filled with the user's OT color and white initials. */
export function OvertimeUserAvatar({ userId, name, className }: OvertimeUserAvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white',
        className,
      )}
      style={{ backgroundColor: userColor(userId) }}
    >
      {getInitials(name || '?')}
    </span>
  );
}
