import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '@/database/database.service';
import { OvertimeEntity, overtimeWithUserInclude } from './overtime.entity';

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

  create(data: Prisma.OvertimeUncheckedCreateInput): Promise<OvertimeEntity> {
    return this.db.overtime.create({ data, include: overtimeWithUserInclude });
  }

  update(id: string, data: Prisma.OvertimeUpdateInput): Promise<OvertimeEntity> {
    return this.db.overtime.update({ where: { id }, data, include: overtimeWithUserInclude });
  }

  delete(id: string): Promise<OvertimeEntity> {
    return this.db.overtime.delete({ where: { id }, include: overtimeWithUserInclude });
  }
}
