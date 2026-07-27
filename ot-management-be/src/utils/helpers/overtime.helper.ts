/**
 * Duration in hours between two "HH:mm" time strings.
 * Supports overnight ranges (end earlier than start rolls over midnight).
 */
export function computeOvertimeHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes <= 0) minutes += 24 * 60;
  return Math.round((minutes / 60) * 100) / 100;
}

/** Round an hour total to 2 decimals — float sums drift (8.4 + 2.1 = 10.500000000000002). */
export function roundHours(hours: number): number {
  return Math.round(hours * 100) / 100;
}

/** "HH:mm" -> minutes since midnight. */
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

/**
 * Whether two time ranges on the same day overlap. Touching boundaries do NOT
 * overlap (17:00–19:00 and 19:00–20:00 are fine). Overnight ranges roll over.
 */
export function overtimeRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const a1 = toMinutes(startA);
  let a2 = toMinutes(endA);
  if (a2 <= a1) a2 += 24 * 60;

  const b1 = toMinutes(startB);
  let b2 = toMinutes(endB);
  if (b2 <= b1) b2 += 24 * 60;

  return a1 < b2 && b1 < a2;
}
