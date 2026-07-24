import { AuthGuard } from '@/shared/providers/guards/RoleGuard';
import TeamOvertime from '@/features/overtime/pages/TeamOvertime';

export default function TeamOvertimePage() {
  return (
    <AuthGuard>
      <TeamOvertime />
    </AuthGuard>
  );
}
