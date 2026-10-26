import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class QueryDashboardDto {
  /** Inclusive start date (YYYY-MM-DD). */
  @IsDateString()
  from!: string;

  /** Exclusive end date (YYYY-MM-DD). */
  @IsDateString()
  to!: string;

  /** Narrow the per-day trend (`daily`) to one member. Every other figure stays company-wide. */
  @IsOptional()
  @IsUUID()
  userId?: string;
}
