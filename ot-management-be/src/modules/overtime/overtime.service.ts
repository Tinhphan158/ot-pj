import { Injectable } from '@nestjs/common';
import { computeOvertimeHours } from '@/utils';
import { NotFoundException } from '@/common';
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

  async create(actor: JwtPayload, dto: CreateOvertimeDto): Promise<OvertimeResponseDto> {
    const hours = computeOvertimeHours(dto.startTime, dto.endTime);
    const entity = await this.overtimeRepository.create({
      userId: actor.id,
      date: new Date(dto.date),
      startTime: dto.startTime,
      endTime: dto.endTime,
      hours,
      reason: dto.reason,
    });
    const overtime = OvertimeMapper.toResponse(entity);
    this.gateway.emit('created', { overtime, actor: { id: actor.id, name: actor.name } });
    return overtime;
  }

  async update(id: string, dto: UpdateOvertimeDto, actor: JwtPayload): Promise<OvertimeResponseDto> {
    const current = await this.getOrThrow(id);

    const startTime = dto.startTime ?? current.startTime;
    const endTime = dto.endTime ?? current.endTime;
    const timesChanged = dto.startTime !== undefined || dto.endTime !== undefined;

    const entity = await this.overtimeRepository.update(id, {
      ...(dto.date !== undefined ? { date: new Date(dto.date) } : {}),
      ...(dto.startTime !== undefined ? { startTime } : {}),
      ...(dto.endTime !== undefined ? { endTime } : {}),
      ...(dto.reason !== undefined ? { reason: dto.reason } : {}),
      ...(timesChanged ? { hours: computeOvertimeHours(startTime, endTime) } : {}),
    });

    const overtime = OvertimeMapper.toResponse(entity);
    this.gateway.emit('updated', { overtime, actor: { id: actor.id, name: actor.name } });
    return overtime;
  }

  async remove(id: string, actor: JwtPayload): Promise<void> {
    await this.getOrThrow(id);
    const entity = await this.overtimeRepository.delete(id);
    const overtime = OvertimeMapper.toResponse(entity);
    this.gateway.emit('deleted', { overtime, actor: { id: actor.id, name: actor.name } });
  }
}
