import { AuthGuard } from '@/shared/providers/guards/RoleGuard';
import OvertimeActivity from '@/features/overtime/pages/OvertimeActivity';

export default function ActivityPage() {
  return (
    <AuthGuard>
      <OvertimeActivity />
    </AuthGuard>
  );
}
