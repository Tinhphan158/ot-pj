import { Injectable } from '@nestjs/common';
import {
  ENV,
  OVERTIME_MONTHLY_LIMIT_HOURS,
  OVERTIME_MULTIPLIERS,
  OVERTIME_WINDOWS,
  OVERTIME_YEARLY_LIMIT_HOURS,
  VN_HOLIDAYS,
  computeOvertimeHours,
  isOtMonthLocked,
  otMonthLockDate,
  otMonthRange,
  otYearRange,
  overtimeRangesOverlap,
  overtimeWindowFor,
  overtimeWindowViolation,
  roundHours,
  startOfToday,
  toDateString,
} from '@/utils';
import { BadRequestException, ConflictException, EnvConfig, ForbiddenException, NotFoundException } from '@/common';
import type { JwtPayload } from '@/common';
import { OvertimeRepository } from './overtime.repository';
import { OvertimeMapper } from './overtime.mapper';
import { OvertimeEntity } from './overtime.entity';
import {
  OvertimeAuditPageResponseDto,
  OvertimeResponseDto,
  OvertimeRulesResponseDto,
  OvertimeUsagePeriodDto,
  OvertimeUsageResponseDto,
} from './overtime.response';
import { OvertimeGateway } from './overtime.gateway';
import {
  CreateOvertimeDto,
  QueryOvertimeAuditDto,
  QueryOvertimeRangeDto,
  QueryOvertimeUsageDto,
  UpdateOvertimeDto,
} from './dto';

const AUDIT_PAGE_SIZE = 30;

@Injectable()
export class OvertimeService {
  constructor(
    private readonly overtimeRepository: OvertimeRepository,
    private readonly gateway: OvertimeGateway,
    private readonly env: EnvConfig,
  ) {}

  private get lockGraceDays(): number {
    return this.env.getNumber(ENV.OVERTIME_LOCK_GRACE_DAYS);
  }

  /** All overtime registered within [from, to) across the whole company. */
  async findByRange(query: QueryOvertimeRangeDto): Promise<OvertimeResponseDto[]> {
    const items = await this.overtimeRepository.findMany({
      date: { gte: new Date(query.from), lt: new Date(query.to) },
    });
    return OvertimeMapper.toResponseList(items);
  }

  getRules(): OvertimeRulesResponseDto {
    return {
      limits: { monthlyHours: OVERTIME_MONTHLY_LIMIT_HOURS, yearlyHours: OVERTIME_YEARLY_LIMIT_HOURS },
      windows: OVERTIME_WINDOWS,
      multipliers: OVERTIME_MULTIPLIERS,
      holidays: Object.entries(VN_HOLIDAYS)
        .map(([date, name]) => ({ date, name }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      lockGraceDays: this.lockGraceDays,
    };
  }

  async getUsage(actor: JwtPayload, query: QueryOvertimeUsageDto): Promise<OvertimeUsageResponseDto> {
    const date = new Date(query.date);
    const today = startOfToday();

    const period = async (range: { start: Date; end: Date }, limit: number): Promise<OvertimeUsagePeriodDto> => {
      // Worked stops at yesterday, so it can never reach past the period's end.
      const workedEnd = today < range.end ? today : range.end;
      const [registered, worked] = await Promise.all([
        this.overtimeRepository.sumHoursForUser(actor.id, range.start, range.end),
        workedEnd > range.start ? this.overtimeRepository.sumHoursForUser(actor.id, range.start, workedEnd) : 0,
      ]);
      return {
        from: toDateString(range.start),
        to: toDateString(range.end),
        limit,
        registered: roundHours(registered),
        worked: roundHours(worked),
      };
    };

    const [monthly, yearly] = await Promise.all([
      period(otMonthRange(date), OVERTIME_MONTHLY_LIMIT_HOURS),
      period(otYearRange(date), OVERTIME_YEARLY_LIMIT_HOURS),
    ]);
    return { monthly, yearly };
  }

  async findAuditLogs(query: QueryOvertimeAuditDto): Promise<OvertimeAuditPageResponseDto> {
    const take = query.limit ?? AUDIT_PAGE_SIZE;
    // One extra row tells whether another page exists without a count query.
    const rows = await this.overtimeRepository.findAuditLogs({
      overtimeId: query.overtimeId,
      actorId: query.actorId,
      cursor: query.cursor,
      take: take + 1,
    });
    const page = rows.slice(0, take);
    return {
      items: page.map((row) => OvertimeMapper.toAuditLogResponse(row)),
      nextCursor: rows.length > take ? page[page.length - 1].id : null,
    };
  }

  private async getOrThrow(id: string): Promise<OvertimeEntity> {
    const entity = await this.overtimeRepository.findById(id);
    if (!entity) throw new NotFoundException('Overtime record not found', 'OVERTIME_NOT_FOUND');
    return entity;
  }

  /** Reject a new/edited range that overlaps another OT of the same user on that day. */
  private async assertNoOverlap(
    userId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<void> {
    const sameDay = await this.overtimeRepository.findByUserAndDate(userId, date);
    const clash = sameDay.find(
      (o) => o.id !== excludeId && overtimeRangesOverlap(startTime, endTime, o.startTime, o.endTime),
    );
    if (clash) {
      throw new ConflictException(
        `This time range overlaps another of your overtime entries (${clash.startTime}–${clash.endTime})`,
        'OVERTIME_OVERLAP',
      );
    }
  }

  /** Reject a range that falls outside the hours overtime may be registered in on that day. */
  private assertWithinWindow(date: Date, startTime: string, endTime: string): void {
    const violation = overtimeWindowViolation(startTime, endTime, overtimeWindowFor(date));
    if (violation) throw new BadRequestException(violation, 'OVERTIME_OUTSIDE_WINDOW');
  }

  /**
   * Reject any change touching an OT month that has been closed. Once the grace
   * period after the 20th has passed the month's figures are final.
   */
  private assertNotLocked(date: Date): void {
    if (!isOtMonthLocked(date, this.lockGraceDays)) return;
    const { start, end } = otMonthRange(date);
    const lastDay = new Date(end.getTime() - 24 * 60 * 60_000);
    throw new ForbiddenException(
      `The OT month ${toDateString(start)} – ${toDateString(lastDay)} was closed on ` +
        `${toDateString(otMonthLockDate(date, this.lockGraceDays))} and can no longer be changed`,
      'OVERTIME_PERIOD_LOCKED',
    );
  }

  /**
   * Reject an entry that would push the user past the monthly or yearly cap.
   * Everything registered in the period counts, upcoming days included — the
   * cap limits what may be booked, not only what has been worked.
   */
  private async assertWithinLimits(userId: string, date: Date, hours: number, excludeId?: string): Promise<void> {
    const periods = [
      { range: otMonthRange(date), limit: OVERTIME_MONTHLY_LIMIT_HOURS, label: 'monthly', code: 'OVERTIME_MONTHLY_LIMIT' },
      { range: otYearRange(date), limit: OVERTIME_YEARLY_LIMIT_HOURS, label: 'yearly', code: 'OVERTIME_YEARLY_LIMIT' },
    ];
    for (const { range, limit, label, code } of periods) {
      const registered = await this.overtimeRepository.sumHoursForUser(userId, range.start, range.end, excludeId);
      if (roundHours(registered + hours) > limit) {
        const remaining = roundHours(Math.max(0, limit - registered));
        throw new BadRequestException(
          `This would exceed the ${limit}h ${label} overtime limit — you have ${roundHours(registered)}h registered and ${remaining}h left`,
          code,
        );
      }
    }
  }

  private assertOwner(ownerId: string, actor: JwtPayload): void {
    if (ownerId !== actor.id) {
      throw new ForbiddenException('You cannot edit or delete overtime entries that belong to someone else', 'NOT_OVERTIME_OWNER');
    }
  }

  async create(actor: JwtPayload, dto: CreateOvertimeDto): Promise<OvertimeResponseDto> {
    const date = new Date(dto.date);
    this.assertNotLocked(date);
    this.assertWithinWindow(date, dto.startTime, dto.endTime);
    await this.assertNoOverlap(actor.id, date, dto.startTime, dto.endTime);

    const hours = computeOvertimeHours(dto.startTime, dto.endTime);
    await this.assertWithinLimits(actor.id, date, hours);

    const entity = await this.overtimeRepository.create(
      { userId: actor.id, date, startTime: dto.startTime, endTime: dto.endTime, hours },
      actor.id,
    );
    const overtime = OvertimeMapper.toResponse(entity);
    this.gateway.emit('created', { overtime, actor: { id: actor.id, name: overtime.user?.name ?? actor.name } });
    return overtime;
  }

  async update(id: string, dto: UpdateOvertimeDto, actor: JwtPayload): Promise<OvertimeResponseDto> {
    const current = await this.getOrThrow(id);
    this.assertOwner(current.userId, actor);

    const startTime = dto.startTime ?? current.startTime;
    const endTime = dto.endTime ?? current.endTime;
    const timesChanged = dto.startTime !== undefined || dto.endTime !== undefined;
    const date = dto.date !== undefined ? new Date(dto.date) : current.date;

    // Both ends of a move are checked: an entry may neither leave a closed month
    // nor be moved into one.
    this.assertNotLocked(current.date);
    if (dto.date !== undefined) this.assertNotLocked(date);

    // Checked when the hours or the day move — a different day can have a
    // different window. An entry stored outside the window before the rule
    // existed can still be deleted.
    if (timesChanged || dto.date !== undefined) this.assertWithinWindow(date, startTime, endTime);

    const hours = timesChanged ? computeOvertimeHours(startTime, endTime) : current.hours;

    if (timesChanged || dto.date !== undefined) {
      await this.assertNoOverlap(current.userId, date, startTime, endTime, id);
      // The entry's own hours are left out of the sum, so a resize or a move is
      // measured as if it were registered fresh.
      await this.assertWithinLimits(current.userId, date, hours, id);
    }

    const entity = await this.overtimeRepository.update(
      current,
      {
        ...(dto.date !== undefined ? { date } : {}),
        ...(dto.startTime !== undefined ? { startTime } : {}),
        ...(dto.endTime !== undefined ? { endTime } : {}),
        ...(timesChanged ? { hours } : {}),
      },
      actor.id,
    );

    const overtime = OvertimeMapper.toResponse(entity);
    this.gateway.emit('updated', { overtime, actor: { id: actor.id, name: overtime.user?.name ?? actor.name } });
    return overtime;
  }

  async remove(id: string, actor: JwtPayload): Promise<void> {
    const current = await this.getOrThrow(id);
    this.assertOwner(current.userId, actor);
    this.assertNotLocked(current.date);

    const entity = await this.overtimeRepository.delete(id, actor.id);
    const overtime = OvertimeMapper.toResponse(entity);
    this.gateway.emit('deleted', { overtime, actor: { id: actor.id, name: overtime.user?.name ?? actor.name } });
  }
}
