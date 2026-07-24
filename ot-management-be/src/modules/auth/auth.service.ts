import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { BcryptHelper } from '@/utils';
import { BadRequestException, ExceptionHelper, UnauthorizedException } from '@/common';
import { UserRepository } from '@/modules/user/user.repository';
import { UserMapper } from '@/modules/user/user.mapper';
import { MailService } from '@/modules/mail/mail.service';
import { AuthTokenService } from './auth-token.service';
import { OtpService } from './otp.service';
import { AuthResponseDto, MessageResponseDto } from './auth.response';
import { ForgotPasswordDto, LoginDto, ResetPasswordDto, SignupDto, VerifyOtpDto } from './dto';

const GENERIC_OTP_MESSAGE = 'If an account exists for that email, a verification code has been sent.';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authTokenService: AuthTokenService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
  ) {}

  private async issueTokens(user: User): Promise<AuthResponseDto> {
    const tokens = await this.authTokenService.generateTokens(user);
    const hashed = await this.authTokenService.hashRefreshToken(tokens.refreshToken);
    await this.userRepository.updateRefreshToken(user.id, hashed);

    return { ...tokens, user: UserMapper.toResponse(user) };
  }

  async signup(dto: SignupDto): Promise<AuthResponseDto> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) ExceptionHelper.throwConflict('Email is already in use', 'EMAIL_TAKEN');

    const password = await BcryptHelper.hash(dto.password);
    const user = await this.userRepository.create({
      email: dto.email,
      password,
      name: dto.name,
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Incorrect email or password', 'INVALID_CREDENTIALS');

    const matches = await BcryptHelper.compare(dto.password, user.password);
    if (!matches) throw new UnauthorizedException('Incorrect email or password', 'INVALID_CREDENTIALS');

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    let payload: { id: string };
    try {
      payload = await this.authTokenService.verifyRefreshToken(refreshToken);
    } catch {
      return ExceptionHelper.throwUnauthorized('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    const user = await this.userRepository.findById(payload.id);
    if (!user || !user.refreshToken) {
      return ExceptionHelper.throwUnauthorized('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    const valid = await this.authTokenService.compareRefreshToken(refreshToken, user.refreshToken);
    if (!valid) ExceptionHelper.throwUnauthorized('Invalid refresh token', 'INVALID_REFRESH_TOKEN');

    return this.issueTokens(user);
  }

  async logout(userId: string): Promise<MessageResponseDto> {
    await this.userRepository.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<MessageResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (user) {
      const code = this.otpService.generateCode();
      await this.otpService.store(dto.email, code);
      await this.mailService.sendOtp(dto.email, code);
    }
    return { message: GENERIC_OTP_MESSAGE };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<MessageResponseDto> {
    const valid = await this.otpService.verify(dto.email, dto.otp);
    if (!valid) ExceptionHelper.throwBadRequest('Invalid or expired verification code', 'INVALID_OTP');
    return { message: 'Verification code is valid' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<MessageResponseDto> {
    const valid = await this.otpService.verify(dto.email, dto.otp);
    if (!valid) ExceptionHelper.throwBadRequest('Invalid or expired verification code', 'INVALID_OTP');

    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new BadRequestException('Invalid or expired verification code', 'INVALID_OTP');

    const password = await BcryptHelper.hash(dto.newPassword);
    await this.userRepository.updatePassword(user.id, password);
    await this.userRepository.updateRefreshToken(user.id, null);
    await this.otpService.clear(dto.email);

    return { message: 'Password has been reset successfully' };
  }
}
