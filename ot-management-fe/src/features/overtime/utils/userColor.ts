// A fixed, reasonably distinct palette. Colors are applied via inline styles
// (not Tailwind classes) so they survive JIT purging and stay stable per user.
const PALETTE = [
  '#6366f1', // indigo
  '#0ea5e9', // sky
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#14b8a6', // teal
  '#f97316', // orange
  '#ef4444', // red
  '#84cc16', // lime
  '#06b6d4', // cyan
  '#d946ef', // fuchsia
];

/** Stable color for a user, derived from their id so it's consistent across views. */
export function userColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
