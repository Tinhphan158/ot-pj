import { Injectable } from '@nestjs/common';
import { BcryptHelper } from '@/utils';
import { BadRequestException, NotFoundException } from '@/common';
import { UserRepository } from './user.repository';
import { UserMapper } from './user.mapper';
import { UserResponseDto } from './user.response';
import { ChangePasswordDto, UpdateProfileDto } from './dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    return UserMapper.toResponse(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.userRepository.update(userId, { name: dto.name });
    return UserMapper.toResponse(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found', 'USER_NOT_FOUND');

    const matches = await BcryptHelper.compare(dto.currentPassword, user.password);
    if (!matches) throw new BadRequestException('Mật khẩu hiện tại không đúng', 'WRONG_CURRENT_PASSWORD');

    const hashed = await BcryptHelper.hash(dto.newPassword);
    await this.userRepository.updatePassword(userId, hashed);
    return { message: 'Đổi mật khẩu thành công' };
  }
}
