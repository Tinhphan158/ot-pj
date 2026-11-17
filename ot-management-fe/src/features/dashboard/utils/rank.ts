import type { DashboardMemberStat } from '@/shared/api';

/**
 * Competition ranks ("1, 1, 3") for a leaderboard the API has already sorted by
 * hours worked, then fewest entries, then fewest days. Members level on all three
 * share a place, so name order — the last tie-break — never decides a rank.
 */
export function computeRanks(members: DashboardMemberStat[]): number[] {
  const ranks: number[] = [];
  members.forEach((member, index) => {
    const previous = members[index - 1];
    const tied =
      previous !== undefined &&
      previous.hours === member.hours &&
      previous.entries === member.entries &&
      previous.days === member.days;
    ranks.push(tied ? ranks[index - 1] : index + 1);
  });
  return ranks;
}
