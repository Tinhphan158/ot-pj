import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class UserRepository {
  constructor(private readonly db: DatabaseService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.db.user.create({ data });
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.db.user.update({ where: { id }, data });
  }

  delete(id: string): Promise<User> {
    return this.db.user.delete({ where: { id } });
  }

  updateRefreshToken(id: string, refreshToken: string | null): Promise<User> {
    return this.db.user.update({ where: { id }, data: { refreshToken } });
  }

  updatePassword(id: string, password: string): Promise<User> {
    return this.db.user.update({ where: { id }, data: { password } });
  }
}
