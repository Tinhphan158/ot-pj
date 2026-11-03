import { Body, Controller, Get, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '@/decorators';
import type { JwtPayload } from '@/common';
import { UserService, type AvatarFile } from './user.service';
import { UserResponseDto } from './user.response';
import { ChangePasswordDto, UpdateProfileDto } from './dto';

/** Upper bound for an avatar upload; the image is shrunk on Cloudinary anyway. */
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
    return this.userService.getMe(user.id);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto): Promise<UserResponseDto> {
    return this.userService.updateProfile(user.id, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: AVATAR_MAX_BYTES, files: 1 } }))
  uploadAvatar(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: AvatarFile | undefined,
  ): Promise<UserResponseDto> {
    return this.userService.uploadAvatar(user.id, file);
  }

  @Patch('me/password')
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.userService.changePassword(user.id, dto);
  }
}
