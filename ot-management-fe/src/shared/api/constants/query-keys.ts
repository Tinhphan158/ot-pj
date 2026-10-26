export const overtimeKeys = {
  all: ['overtimes'] as const,
  range: (from: string, to: string) => [...overtimeKeys.all, 'range', from, to] as const,
  rules: ['overtime-rules'] as const,
  usage: (date: string) => [...overtimeKeys.all, 'usage', date] as const,
  auditLogs: (filters: { overtimeId?: string; actorId?: string }) => [...overtimeKeys.all, 'audit-logs', filters] as const,
};

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: (from: string, to: string, userId?: string) => [...dashboardKeys.all, 'stats', from, to, userId ?? null] as const,
};

export const userKeys = {
  all: ['users'] as const,
};
