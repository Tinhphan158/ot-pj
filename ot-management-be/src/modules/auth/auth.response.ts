import { UserResponseDto } from '@/modules/user/user.response';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponseDto = AuthTokens & {
  user: UserResponseDto;
};

export type MessageResponseDto = {
  message: string;
};
