import { AuthGuard } from '@/shared/providers/guards/RoleGuard';
import Dashboard from '@/features/dashboard/pages/Dashboard';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}
