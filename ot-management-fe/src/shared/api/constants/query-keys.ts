export const overtimeKeys = {
  all: ['overtimes'] as const,
  range: (from: string, to: string) => [...overtimeKeys.all, 'range', from, to] as const,
};

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: (from: string, to: string) => [...dashboardKeys.all, 'stats', from, to] as const,
};
