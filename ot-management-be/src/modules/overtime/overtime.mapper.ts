import { toDateString } from '@/utils';
import { OvertimeAuditLogEntity, OvertimeEntity, OvertimeSnapshot } from './overtime.entity';
import { OvertimeAuditLogResponseDto, OvertimeResponseDto } from './overtime.response';

export class OvertimeMapper {
  static toResponse(entity: OvertimeEntity): OvertimeResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      user: entity.user
        ? {
            id: entity.user.id,
            name: entity.user.name,
            email: entity.user.email,
            avatar: entity.user.avatar,
          }
        : null,
      date: toDateString(entity.date),
      startTime: entity.startTime,
      endTime: entity.endTime,
      hours: entity.hours,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponseList(entities: OvertimeEntity[]): OvertimeResponseDto[] {
    return entities.map((entity) => OvertimeMapper.toResponse(entity));
  }

  static toAuditLogResponse(entity: OvertimeAuditLogEntity): OvertimeAuditLogResponseDto {
    return {
      id: entity.id,
      overtimeId: entity.overtimeId,
      action: entity.action,
      actor: entity.actor,
      // Written only by the repository's `snapshot`, so the shape is known.
      before: entity.before as OvertimeSnapshot | null,
      after: entity.after as OvertimeSnapshot | null,
      createdAt: entity.createdAt,
    };
  }
}
