import { axiosInstance, http } from '@/lib/http';
import { API_PATHS } from '@/shared/api/constants/api-paths';
import type { Overtime, OvertimeAuditPage, OvertimeRules, OvertimeUsage } from '@/shared/api/types';

export interface CreateOvertimePayload {
  date: string;
  startTime: string;
  endTime: string;
}

export type UpdateOvertimePayload = Partial<CreateOvertimePayload>;

export interface OvertimeAuditQuery {
  overtimeId?: string;
  actorId?: string;
  cursor?: string;
  limit?: number;
}

export const overtimeService = {
  findByRange: (from: string, to: string) =>
    http.get<Overtime[]>(API_PATHS.OVERTIMES.RANGE, { params: { from, to } }),
  getRules: () => http.get<OvertimeRules>(API_PATHS.OVERTIMES.RULES),
  getUsage: (date: string) => http.get<OvertimeUsage>(API_PATHS.OVERTIMES.USAGE, { params: { date } }),
  findAuditLogs: (query: OvertimeAuditQuery) =>
    http.get<OvertimeAuditPage>(API_PATHS.OVERTIMES.AUDIT_LOGS, { params: query }),
  /** The payroll workbook for [from, to) — a raw file, so it skips the JSON envelope `http` unwraps. */
  exportXlsx: async (from: string, to: string, userId?: string): Promise<Blob> => {
    const response = await axiosInstance.get<Blob>(API_PATHS.OVERTIMES.EXPORT, {
      params: { from, to, userId },
      responseType: 'blob',
    });
    return response.data;
  },
  create: (payload: CreateOvertimePayload) => http.post<Overtime>(API_PATHS.OVERTIMES.BASE, payload),
  update: (id: string, payload: UpdateOvertimePayload) => http.patch<Overtime>(API_PATHS.OVERTIMES.DETAIL(id), payload),
  remove: (id: string) => http.delete<void>(API_PATHS.OVERTIMES.DETAIL(id)),
};
