export const overtimeKeys = {
  all: ['overtimes'] as const,
  range: (from: string, to: string) => [...overtimeKeys.all, 'range', from, to] as const,
};
