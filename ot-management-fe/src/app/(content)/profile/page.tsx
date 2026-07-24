import { AuthGuard } from '@/shared/providers/guards/RoleGuard';
import ProfileManagement from '@/features/profile/pages/ProfileManagement';

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileManagement />
    </AuthGuard>
  );
}
