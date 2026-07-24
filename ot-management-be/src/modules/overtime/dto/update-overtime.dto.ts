import { IsDateString, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class UpdateOvertimeDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @Matches(TIME_REGEX, { message: 'startTime must be in HH:mm format' })
  startTime?: string;

  @IsOptional()
  @Matches(TIME_REGEX, { message: 'endTime must be in HH:mm format' })
  endTime?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason?: string;
}
