import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { EnvConfig, JwtPayload } from '@/common';
import { ENV } from '@/utils/constants/env.const';
import { BcryptHelper, JwtHelper } from '@/utils';
import { AuthTokens } from './auth.response';

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly env: EnvConfig,
  ) {}

  private buildPayload(user: User): JwtPayload {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    };
  }

  async generateTokens(user: User): Promise<AuthTokens> {
    const payload = this.buildPayload(user);

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.env.get(ENV.JWT_REFRESH_SECRET),
      expiresIn: JwtHelper.parseExpiresToSeconds(this.env.get(ENV.JWT_REFRESH_EXPIRES_IN)),
    });

    return { accessToken, refreshToken };
  }

  verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.env.get(ENV.JWT_REFRESH_SECRET),
    });
  }

  hashRefreshToken(token: string): Promise<string> {
    return BcryptHelper.hash(token);
  }

  compareRefreshToken(token: string, hashed: string): Promise<boolean> {
    return BcryptHelper.compare(token, hashed);
  }
}
