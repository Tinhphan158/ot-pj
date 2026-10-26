import { http } from '@/lib/http';
import { API_PATHS } from '@/shared/api/constants/api-paths';
import type { DashboardStats } from '@/shared/api/types';

export const dashboardService = {
  /** `userId` narrows the per-day trend to one member; every other figure stays company-wide. */
  getStats: (from: string, to: string, userId?: string) =>
    http.get<DashboardStats>(API_PATHS.DASHBOARD.BASE, { params: { from, to, userId } }),
};
