import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { EnvConfig } from '@/common';
import { ENV } from '@/utils/constants/env.const';
import { initApplication } from './app';

async function bootstrap() {
  const app = await initApplication();
  const env = app.get(EnvConfig);
  const port = env.getNumber(ENV.PORT);
  await app.listen(port);
  new Logger('Main').log(`Server is running on http://localhost:${port}/api`);
}

void bootstrap();
