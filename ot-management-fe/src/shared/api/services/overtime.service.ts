import { http } from '@/lib/http';
import { API_PATHS } from '@/shared/api/constants/api-paths';
import type { Overtime } from '@/shared/api/types';

export interface CreateOvertimePayload {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export type UpdateOvertimePayload = Partial<CreateOvertimePayload>;

export const overtimeService = {
  findByRange: (from: string, to: string) =>
    http.get<Overtime[]>(API_PATHS.OVERTIMES.RANGE, { params: { from, to } }),
  create: (payload: CreateOvertimePayload) => http.post<Overtime>(API_PATHS.OVERTIMES.BASE, payload),
  update: (id: string, payload: UpdateOvertimePayload) => http.patch<Overtime>(API_PATHS.OVERTIMES.DETAIL(id), payload),
  remove: (id: string) => http.delete<void>(API_PATHS.OVERTIMES.DETAIL(id)),
};
