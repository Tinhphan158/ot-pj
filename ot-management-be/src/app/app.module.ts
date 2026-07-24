import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { envValidationSchema } from '@/common/env/env.validation';
import { DatabaseModule } from '@/database/database.module';
import { GlobalModule } from '@/modules/global/global.module';
import { JwtAuthModule } from '@/modules/jwt';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { OvertimeModule } from '@/modules/overtime/overtime.module';
import { MailModule } from '@/modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100 }]),
    CacheModule.register({ isGlobal: true }),
    DatabaseModule,
    GlobalModule,
    JwtAuthModule,
    MailModule,
    AuthModule,
    UserModule,
    OvertimeModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
