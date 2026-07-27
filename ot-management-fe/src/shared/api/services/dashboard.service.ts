import { http } from '@/lib/http';
import { API_PATHS } from '@/shared/api/constants/api-paths';
import type { DashboardStats } from '@/shared/api/types';

export const dashboardService = {
  getStats: (from: string, to: string) =>
    http.get<DashboardStats>(API_PATHS.DASHBOARD.BASE, { params: { from, to } }),
};
