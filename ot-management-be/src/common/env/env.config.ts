import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from '@/utils/constants/env.const';

export type EnvKey = (typeof ENV)[keyof typeof ENV];

@Injectable()
export class EnvConfig {
  constructor(private readonly configService: ConfigService) {}

  get(key: EnvKey): string {
    return this.configService.getOrThrow<string>(key);
  }

  getOptional(key: EnvKey): string | undefined {
    return this.configService.get<string>(key);
  }

  getNumber(key: EnvKey): number {
    return Number(this.get(key));
  }
}
