import { IsDateString } from 'class-validator';

export class QueryOvertimeRangeDto {
  /** Inclusive start date (YYYY-MM-DD). */
  @IsDateString()
  from!: string;

  /** Exclusive end date (YYYY-MM-DD). */
  @IsDateString()
  to!: string;
}
