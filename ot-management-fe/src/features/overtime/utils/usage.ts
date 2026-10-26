/** Share of a cap at which the UI starts warning. */
export const USAGE_WARNING_RATIO = 0.8;

export type UsageLevel = 'ok' | 'warning' | 'over';

export function usageLevel(hours: number, limit: number): UsageLevel {
  if (hours > limit) return 'over';
  if (hours >= limit * USAGE_WARNING_RATIO) return 'warning';
  return 'ok';
}
