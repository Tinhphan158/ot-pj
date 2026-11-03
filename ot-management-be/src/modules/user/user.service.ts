import { Injectable } from '@nestjs/common';
import { BcryptHelper } from '@/utils';
import { BadRequestException, NotFoundException } from '@/common';
import { CloudinaryService } from '@/modules/cloudinary/cloudinary.service';
import { UserRepository } from './user.repository';
import { UserMapper } from './user.mapper';
import { UserResponseDto } from './user.response';
import { ChangePasswordDto, UpdateProfileDto } from './dto';

/** The part of a multer upload the avatar flow needs. */
export interface AvatarFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

const AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cloudinary: CloudinaryService,
  ) {}

  /** Everyone in the company, by name — the dashboard's member filter lists these. */
  async findAll(): Promise<UserResponseDto[]> {
    return UserMapper.toResponseList(await this.userRepository.findAll());
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    return UserMapper.toResponse(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.userRepository.update(userId, {
      name: dto.name,
      ...(dto.avatar !== undefined ? { avatar: dto.avatar || null } : {}),
    });
    return UserMapper.toResponse(user);
  }

  async uploadAvatar(userId: string, file: AvatarFile | undefined): Promise<UserResponseDto> {
    if (!file) throw new BadRequestException('Choose an image to upload', 'AVATAR_REQUIRED');
    if (!AVATAR_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Avatar must be a JPG, PNG, WEBP or GIF image', 'AVATAR_INVALID_TYPE');
    }

    // One image per user: the public id is the user id, so a new upload replaces the old one.
    const url = await this.cloudinary.uploadImage(file, {
      publicId: userId,
      transformation: 'c_fill,g_face,w_512,h_512,q_auto',
    });
    const user = await this.userRepository.update(userId, { avatar: url });
    return UserMapper.toResponse(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found', 'USER_NOT_FOUND');

    const matches = await BcryptHelper.compare(dto.currentPassword, user.password);
    if (!matches) throw new BadRequestException('Current password is incorrect', 'WRONG_CURRENT_PASSWORD');

    const hashed = await BcryptHelper.hash(dto.newPassword);
    await this.userRepository.updatePassword(userId, hashed);
    return { message: 'Password changed successfully' };
  }
}
