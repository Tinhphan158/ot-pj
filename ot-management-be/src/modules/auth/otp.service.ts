import { randomInt } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { BcryptHelper } from '@/utils';
import { OTP } from '@/utils/constants/app.const';

@Injectable()
export class OtpService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  private key(email: string): string {
    return `${OTP.CACHE_PREFIX}${email.toLowerCase()}`;
  }

  generateCode(): string {
    return randomInt(0, 10 ** OTP.LENGTH)
      .toString()
      .padStart(OTP.LENGTH, '0');
  }

  async store(email: string, code: string): Promise<void> {
    const hashed = await BcryptHelper.hash(code);
    await this.cache.set(this.key(email), hashed, OTP.TTL_MS);
  }

  async verify(email: string, code: string): Promise<boolean> {
    const hashed = await this.cache.get<string>(this.key(email));
    if (!hashed) return false;
    return BcryptHelper.compare(code, hashed);
  }

  async clear(email: string): Promise<void> {
    await this.cache.del(this.key(email));
  }
}
