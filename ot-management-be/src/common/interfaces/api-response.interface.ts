import { HttpStatus } from '@nestjs/common';

export interface ApiResponse<T> {
  status: HttpStatus;
  message?: string;
  data?: T;
}
