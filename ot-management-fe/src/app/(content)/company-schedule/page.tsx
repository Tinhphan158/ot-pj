import { AuthGuard } from '@/shared/providers/guards/RoleGuard';
import CompanySchedule from '@/features/company-schedule/pages/CompanySchedule';

export default function CompanySchedulePage() {
  return (
    <AuthGuard>
      <CompanySchedule />
    </AuthGuard>
  );
}
