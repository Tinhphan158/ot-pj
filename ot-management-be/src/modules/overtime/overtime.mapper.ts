import { toDateString } from '@/utils';
import { OvertimeEntity } from './overtime.entity';
import { OvertimeResponseDto } from './overtime.response';

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
}
