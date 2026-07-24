import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const BcryptHelper = {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  },
  compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  },
};
