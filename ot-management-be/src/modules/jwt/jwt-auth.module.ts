import { EnvConfig } from '@/common';
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ENV } from '@/utils/constants/env.const';
import { JwtHelper } from '@/utils';
import { JwtStrategy } from './strategies/jwt.strategy';

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [EnvConfig],
      useFactory: (env: EnvConfig) => ({
        secret: env.get(ENV.JWT_ACCESS_SECRET),
        signOptions: {
          expiresIn: JwtHelper.parseExpiresToSeconds(env.get(ENV.JWT_ACCESS_EXPIRES_IN)),
        },
      }),
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class JwtAuthModule {}
