import { Injectable } from '@nestjs/common';
import { Workbook, type Worksheet } from 'exceljs';
import {
  OVERTIME_MULTIPLIERS,
  VN_HOLIDAYS,
  overtimeDayType,
  roundHours,
  startOfToday,
  toDateString,
  type OvertimeDayType,
} from '@/utils';
import { OvertimeRepository } from './overtime.repository';
import { QueryOvertimeExportDto } from './dto';

const DAY_TYPE_LABEL: Record<OvertimeDayType, string> = {
  weekday: 'Weekday',
  weekend: 'Weekend',
  holiday: 'Holiday',
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type MemberSummary = {
  name: string;
  email: string;
  entries: number;
  days: Set<string>;
  hours: Record<OvertimeDayType, number>;
  paidHours: number;
  upcomingHours: number;
};

/** "2026-10-21" → "21/10/2026", the format the rest of the app shows. */
function displayDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function styleHeader(sheet: Worksheet): void {
  const header = sheet.getRow(1);
  header.font = { bold: true };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } };
}

@Injectable()
export class OvertimeExportService {
  constructor(private readonly overtimeRepository: OvertimeRepository) {}

  /**
   * Payroll workbook for [from, to): a per-member summary split by day type
   * with the pay-weighted hours, and every entry underneath it. Entries for days
   * that have not arrived yet are included but flagged, so a mid-period export
   * is not mistaken for final figures.
   */
  async exportXlsx(query: QueryOvertimeExportDto): Promise<Buffer> {
    const items = await this.overtimeRepository.findMany({
      date: { gte: new Date(query.from), lt: new Date(query.to) },
      ...(query.userId ? { userId: query.userId } : {}),
    });
    items.sort(
      (a, b) =>
        a.date.getTime() - b.date.getTime() ||
        (a.user?.name ?? '').localeCompare(b.user?.name ?? '') ||
        a.startTime.localeCompare(b.startTime),
    );

    const today = startOfToday();
    const workbook = new Workbook();
    workbook.created = new Date();

    const lastDay = toDateString(new Date(new Date(query.to).getTime() - 24 * 60 * 60_000));
    const period = `${displayDate(query.from)} – ${displayDate(lastDay)}`;

    const detailColumns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Day', key: 'weekday', width: 6 },
      { header: 'Day type', key: 'dayType', width: 10 },
      { header: 'Holiday', key: 'holiday', width: 28 },
      { header: 'Name', key: 'name', width: 24 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Start', key: 'start', width: 8 },
      { header: 'End', key: 'end', width: 8 },
      { header: 'Hours', key: 'hours', width: 8 },
      { header: 'Rate', key: 'rate', width: 7 },
      { header: 'Paid hours', key: 'paid', width: 11 },
      { header: 'Status', key: 'status', width: 10 },
    ];
    const detailRows: Record<string, string | number>[] = [];

    const byMember = new Map<string, MemberSummary>();

    for (const item of items) {
      const iso = toDateString(item.date);
      const dayType = overtimeDayType(item.date);
      const rate = OVERTIME_MULTIPLIERS[dayType];
      const upcoming = item.date >= today;

      detailRows.push({
        date: displayDate(iso),
        weekday: WEEKDAYS[item.date.getUTCDay()],
        dayType: DAY_TYPE_LABEL[dayType],
        holiday: VN_HOLIDAYS[iso] ?? '',
        name: item.user?.name ?? '',
        email: item.user?.email ?? '',
        start: item.startTime,
        end: item.endTime,
        hours: item.hours,
        rate,
        paid: roundHours(item.hours * rate),
        status: upcoming ? 'Upcoming' : 'Worked',
      });

      const member = byMember.get(item.userId) ?? {
        name: item.user?.name ?? '',
        email: item.user?.email ?? '',
        entries: 0,
        days: new Set<string>(),
        hours: { weekday: 0, weekend: 0, holiday: 0 },
        paidHours: 0,
        upcomingHours: 0,
      };
      member.entries += 1;
      member.days.add(iso);
      member.hours[dayType] += item.hours;
      member.paidHours += item.hours * rate;
      if (upcoming) member.upcomingHours += item.hours;
      byMember.set(item.userId, member);
    }

    const summary = workbook.addWorksheet('Summary');
    summary.columns = [
      { header: 'Name', key: 'name', width: 24 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Entries', key: 'entries', width: 9 },
      { header: 'Days', key: 'days', width: 7 },
      { header: 'Weekday h (×1.5)', key: 'weekday', width: 16 },
      { header: 'Weekend h (×2)', key: 'weekend', width: 15 },
      { header: 'Holiday h (×3)', key: 'holiday', width: 15 },
      { header: 'Total hours', key: 'total', width: 12 },
      { header: 'Paid hours', key: 'paid', width: 11 },
      { header: 'Of which upcoming', key: 'upcoming', width: 17 },
    ];
    const members = [...byMember.values()].sort((a, b) => a.name.localeCompare(b.name));
    for (const member of members) {
      summary.addRow({
        name: member.name,
        email: member.email,
        entries: member.entries,
        days: member.days.size,
        weekday: roundHours(member.hours.weekday),
        weekend: roundHours(member.hours.weekend),
        holiday: roundHours(member.hours.holiday),
        total: roundHours(member.hours.weekday + member.hours.weekend + member.hours.holiday),
        paid: roundHours(member.paidHours),
        upcoming: roundHours(member.upcomingHours),
      });
    }
    styleHeader(summary);

    if (members.length > 0) {
      const first = 2;
      const last = members.length + 1;
      const totals = summary.addRow({ name: `Total — ${period}` });
      for (const key of ['entries', 'days', 'weekday', 'weekend', 'holiday', 'total', 'paid', 'upcoming']) {
        const column = summary.getColumn(key).letter;
        totals.getCell(key).value = { formula: `SUM(${column}${first}:${column}${last})` };
      }
      totals.font = { bold: true };
    }

    // Added after the summary so the summary is the first tab payroll sees.
    const details = workbook.addWorksheet('Entries');
    details.columns = detailColumns;
    details.addRows(detailRows);
    styleHeader(details);

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
