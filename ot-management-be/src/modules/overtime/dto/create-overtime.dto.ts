import { IsDateString, Matches } from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateOvertimeDto {
  @IsDateString()
  date: string;

  @Matches(TIME_REGEX, { message: 'startTime must be in HH:mm format' })
  startTime: string;

  @Matches(TIME_REGEX, { message: 'endTime must be in HH:mm format' })
  endTime: string;
}
