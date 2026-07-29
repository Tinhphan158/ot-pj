import { Injectable } from '@nestjs/common';
import { computeOvertimeHours, overtimeRangesOverlap, overtimeWindowViolation } from '@/utils';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@/common';
import type { JwtPayload } from '@/common';
import { OvertimeRepository } from './overtime.repository';
import { OvertimeMapper } from './overtime.mapper';
import { OvertimeEntity } from './overtime.entity';
import { OvertimeResponseDto } from './overtime.response';
import { OvertimeGateway } from './overtime.gateway';
import { CreateOvertimeDto, QueryOvertimeRangeDto, UpdateOvertimeDto } from './dto';

@Injectable()
export class OvertimeService {
  constructor(
    private readonly overtimeRepository: OvertimeRepository,
    private readonly gateway: OvertimeGateway,
  ) {}

  /** All overtime registered within [from, to) across the whole company. */
  async findByRange(query: QueryOvertimeRangeDto): Promise<OvertimeResponseDto[]> {
    const items = await this.overtimeRepository.findMany({
      date: { gte: new Date(query.from), lt: new Date(query.to) },
    });
    return OvertimeMapper.toResponseList(items);
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

  /** Reject a range that falls outside the hours overtime may be registered in. */
  private assertWithinWindow(startTime: string, endTime: string): void {
    const violation = overtimeWindowViolation(startTime, endTime);
    if (violation) throw new BadRequestException(violation, 'OVERTIME_OUTSIDE_WINDOW');
  }

  private assertOwner(ownerId: string, actor: JwtPayload): void {
    if (ownerId !== actor.id) {
      throw new ForbiddenException('You cannot edit or delete overtime entries that belong to someone else', 'NOT_OVERTIME_OWNER');
    }
  }

  async create(actor: JwtPayload, dto: CreateOvertimeDto): Promise<OvertimeResponseDto> {
    const date = new Date(dto.date);
    this.assertWithinWindow(dto.startTime, dto.endTime);
    await this.assertNoOverlap(actor.id, date, dto.startTime, dto.endTime);

    const hours = computeOvertimeHours(dto.startTime, dto.endTime);
    const entity = await this.overtimeRepository.create({
      userId: actor.id,
      date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      hours,
    });
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

    // Only checked when the hours move: an entry stored outside the window before
    // the rule existed can still be shifted to another date.
    if (timesChanged) this.assertWithinWindow(startTime, endTime);

    if (timesChanged || dto.date !== undefined) {
      await this.assertNoOverlap(current.userId, date, startTime, endTime, id);
    }

    const entity = await this.overtimeRepository.update(id, {
      ...(dto.date !== undefined ? { date } : {}),
      ...(dto.startTime !== undefined ? { startTime } : {}),
      ...(dto.endTime !== undefined ? { endTime } : {}),
      ...(timesChanged ? { hours: computeOvertimeHours(startTime, endTime) } : {}),
    });

    const overtime = OvertimeMapper.toResponse(entity);
    this.gateway.emit('updated', { overtime, actor: { id: actor.id, name: overtime.user?.name ?? actor.name } });
    return overtime;
  }

  async remove(id: string, actor: JwtPayload): Promise<void> {
    const current = await this.getOrThrow(id);
    this.assertOwner(current.userId, actor);

    const entity = await this.overtimeRepository.delete(id);
    const overtime = OvertimeMapper.toResponse(entity);
    this.gateway.emit('deleted', { overtime, actor: { id: actor.id, name: overtime.user?.name ?? actor.name } });
  }
}
