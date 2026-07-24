export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface FieldError {
  field: string;
  message: string[];
}

export interface ApiErrorShape {
  statusCode: number;
  message: string;
  errorCode: string;
  errors?: FieldError[];
}
