import { Injectable } from '@nestjs/common';
import { OvertimeAuditAction, Prisma } from '@prisma/client';
import { DatabaseService } from '@/database/database.service';
import { toDateString } from '@/utils';
import {
  OvertimeAuditLogEntity,
  OvertimeEntity,
  OvertimeSnapshot,
  overtimeAuditLogInclude,
  overtimeWithUserInclude,
} from './overtime.entity';

/** What the audit log keeps of an entry — enough to show what it looked like. */
function snapshot(entity: OvertimeEntity): OvertimeSnapshot {
  return {
    userId: entity.userId,
    userName: entity.user?.name ?? null,
    date: toDateString(entity.date),
    startTime: entity.startTime,
    endTime: entity.endTime,
    hours: entity.hours,
  };
}

@Injectable()
export class OvertimeRepository {
  constructor(private readonly db: DatabaseService) {}

  findMany(where: Prisma.OvertimeWhereInput): Promise<OvertimeEntity[]> {
    return this.db.overtime.findMany({
      where,
      orderBy: [{ startTime: 'asc' }, { endTime: 'asc' }],
      include: overtimeWithUserInclude,
    });
  }

  findById(id: string): Promise<OvertimeEntity | null> {
    return this.db.overtime.findUnique({ where: { id }, include: overtimeWithUserInclude });
  }

  findByUserAndDate(userId: string, date: Date): Promise<OvertimeEntity[]> {
    return this.db.overtime.findMany({ where: { userId, date }, include: overtimeWithUserInclude });
  }

  /** Hours a user has registered within [from, to), optionally leaving one record out. */
  async sumHoursForUser(userId: string, from: Date, to: Date, excludeId?: string): Promise<number> {
    const result = await this.db.overtime.aggregate({
      where: {
        userId,
        date: { gte: from, lt: to },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      _sum: { hours: true },
    });
    return result._sum.hours ?? 0;
  }

  // Every write records itself in the audit log inside the same transaction, so
  // a change can never land without its history (or the other way round).

  create(data: Prisma.OvertimeUncheckedCreateInput, actorId: string): Promise<OvertimeEntity> {
    return this.db.$transaction(async (tx) => {
      const entity = await tx.overtime.create({ data, include: overtimeWithUserInclude });
      await tx.overtimeAuditLog.create({
        data: { overtimeId: entity.id, actorId, action: OvertimeAuditAction.CREATED, after: snapshot(entity) },
      });
      return entity;
    });
  }

  update(current: OvertimeEntity, data: Prisma.OvertimeUpdateInput, actorId: string): Promise<OvertimeEntity> {
    return this.db.$transaction(async (tx) => {
      const entity = await tx.overtime.update({ where: { id: current.id }, data, include: overtimeWithUserInclude });
      await tx.overtimeAuditLog.create({
        data: {
          overtimeId: entity.id,
          actorId,
          action: OvertimeAuditAction.UPDATED,
          before: snapshot(current),
          after: snapshot(entity),
        },
      });
      return entity;
    });
  }

  delete(id: string, actorId: string): Promise<OvertimeEntity> {
    return this.db.$transaction(async (tx) => {
      const entity = await tx.overtime.delete({ where: { id }, include: overtimeWithUserInclude });
      await tx.overtimeAuditLog.create({
        data: { overtimeId: entity.id, actorId, action: OvertimeAuditAction.DELETED, before: snapshot(entity) },
      });
      return entity;
    });
  }

  /** Newest first, keyset-paginated: pass the last id of the previous page as `cursor`. */
  findAuditLogs(params: {
    overtimeId?: string;
    actorId?: string;
    cursor?: string;
    take: number;
  }): Promise<OvertimeAuditLogEntity[]> {
    return this.db.overtimeAuditLog.findMany({
      where: {
        ...(params.overtimeId ? { overtimeId: params.overtimeId } : {}),
        ...(params.actorId ? { actorId: params.actorId } : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: params.take,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      include: overtimeAuditLogInclude,
    });
  }
}
