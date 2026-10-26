import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class QueryOvertimeExportDto {
  /** Inclusive start date (YYYY-MM-DD). */
  @IsDateString()
  from!: string;

  /** Exclusive end date (YYYY-MM-DD). */
  @IsDateString()
  to!: string;

  /** Limit the export to one member. */
  @IsOptional()
  @IsUUID()
  userId?: string;
}
