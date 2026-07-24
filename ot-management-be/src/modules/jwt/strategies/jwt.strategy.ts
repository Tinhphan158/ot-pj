import { EnvConfig } from '@/common';
import { Injectable } from '@nestjs/common';
import { ENV } from '@/utils/constants/env.const';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '@/common/interfaces/jwt.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(env: EnvConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.get(ENV.JWT_ACCESS_SECRET),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      avatar: payload.avatar,
    };
  }
}
