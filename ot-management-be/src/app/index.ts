import helmet from 'helmet';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, type INestApplication } from '@nestjs/common';

import { AppModule } from './app.module';
import { EnvConfig, ValidationException } from '@/common';
import { ENV } from '@/utils/constants/env.const';
import { JwtAuthGuard } from '@/modules/jwt';
import { ApiResponseHandler, ExceptionsHandler, LoggingInterceptor } from '@/handlers';

export const initApplication = async (): Promise<INestApplication> => {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.use(helmet());

  const reflector = app.get(Reflector);
  const env = app.get(EnvConfig);
  const corsOrigins = env.get(ENV.CORS_ORIGINS);

  app.enableCors({
    origin: corsOrigins.split(',').map((item) => item.trim()),
    credentials: true,
  });

  // JwtAuthGuard populates request.user; @Public opts endpoints out of auth.
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.useGlobalInterceptors(new LoggingInterceptor(), new ApiResponseHandler());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => new ValidationException(errors),
    }),
  );

  app.useGlobalFilters(new ExceptionsHandler());

  return app;
};
