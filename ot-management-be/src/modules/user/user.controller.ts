import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CurrentUser } from '@/decorators';
import type { JwtPayload } from '@/common';
import { UserService } from './user.service';
import { UserResponseDto } from './user.response';
import { ChangePasswordDto, UpdateProfileDto } from './dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
    return this.userService.getMe(user.id);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto): Promise<UserResponseDto> {
    return this.userService.updateProfile(user.id, dto);
  }

  @Patch('me/password')
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.userService.changePassword(user.id, dto);
  }
}
