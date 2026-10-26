import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class QueryOvertimeAuditDto {
  /** History of a single entry. */
  @IsOptional()
  @IsUUID()
  overtimeId?: string;

  /** Changes made by one member. */
  @IsOptional()
  @IsUUID()
  actorId?: string;

  /** Id of the last log on the previous page. */
  @IsOptional()
  @IsUUID()
  cursor?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
