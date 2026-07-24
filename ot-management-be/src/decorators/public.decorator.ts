import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_API_KEY } from '@/utils';

export function Public() {
  return SetMetadata(IS_PUBLIC_API_KEY, true);
}
