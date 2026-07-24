import { OvertimeEntity } from './overtime.entity';
import { OvertimeResponseDto } from './overtime.response';

/** Format a Date as a YYYY-MM-DD string (date-only field). */
function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

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
          }
        : null,
      date: toDateString(entity.date),
      startTime: entity.startTime,
      endTime: entity.endTime,
      hours: entity.hours,
      reason: entity.reason,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponseList(entities: OvertimeEntity[]): OvertimeResponseDto[] {
    return entities.map((entity) => OvertimeMapper.toResponse(entity));
  }
}
