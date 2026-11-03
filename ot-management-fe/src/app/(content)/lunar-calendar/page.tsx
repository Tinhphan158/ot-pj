import { AuthGuard } from '@/shared/providers/guards/RoleGuard';
import LunarCalendar from '@/features/calendar/pages/LunarCalendar';

export default function LunarCalendarPage() {
  return (
    <AuthGuard>
      <LunarCalendar />
    </AuthGuard>
  );
}
