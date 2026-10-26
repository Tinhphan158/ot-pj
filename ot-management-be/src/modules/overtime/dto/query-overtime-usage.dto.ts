import { IsDateString } from 'class-validator';

export class QueryOvertimeUsageDto {
  /** Any day inside the OT month / year to report on (YYYY-MM-DD). */
  @IsDateString()
  date!: string;
}
