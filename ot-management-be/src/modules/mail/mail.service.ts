import * as nodemailer from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';
import { EnvConfig } from '@/common';
import { ENV } from '@/utils/constants/env.const';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly env: EnvConfig) {
    const host = this.env.getOptional(ENV.MAIL_HOST);
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.env.getOptional(ENV.MAIL_PORT) ?? 587),
        secure: false,
        auth: {
          user: this.env.getOptional(ENV.MAIL_USER),
          pass: this.env.getOptional(ENV.MAIL_PASSWORD),
        },
      });
    }
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    const subject = 'Your OT Management password reset code';
    const text = `Your verification code is ${otp}. It expires in 5 minutes.`;

    if (!this.transporter) {
      // Dev fallback — no SMTP configured.
      this.logger.warn(`[DEV MAIL] To: ${email} | ${text}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.env.getOptional(ENV.MAIL_FROM) ?? 'OT Management <no-reply@ot.local>',
      to: email,
      subject,
      text,
    });
  }
}
