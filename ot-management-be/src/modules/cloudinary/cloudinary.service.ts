import { createHash } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException, EnvConfig, InternalServerException } from '@/common';
import { ENV } from '@/utils/constants/env.const';

export interface UploadImageOptions {
  /** Stable id inside the folder — re-uploading with the same id replaces the old image. */
  publicId: string;
  /** Cloudinary incoming transformation, applied once before the image is stored. */
  transformation?: string;
}

interface CloudinaryUploadResult {
  secure_url: string;
}

/**
 * Signed uploads through Cloudinary's REST API. The secret never leaves the
 * server; the browser only ever sees the resulting `secure_url`.
 */
@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly env: EnvConfig) {}

  private config() {
    const cloudName = this.env.getOptional(ENV.CLOUDINARY_CLOUD_NAME);
    const apiKey = this.env.getOptional(ENV.CLOUDINARY_API_KEY);
    const apiSecret = this.env.getOptional(ENV.CLOUDINARY_API_SECRET);
    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException('Image upload is not configured on the server', 'UPLOAD_NOT_CONFIGURED');
    }
    return { cloudName, apiKey, apiSecret, folder: this.env.getOptional(ENV.CLOUDINARY_FOLDER) || undefined };
  }

  async uploadImage(file: { buffer: Buffer; mimetype: string; originalname?: string }, options: UploadImageOptions) {
    const { cloudName, apiKey, apiSecret, folder } = this.config();

    // Every param except file / api_key goes into the signature, sorted by name.
    const params: Record<string, string> = {
      public_id: options.publicId,
      overwrite: 'true',
      invalidate: 'true',
      timestamp: String(Math.floor(Date.now() / 1000)),
      ...(folder ? { folder } : {}),
      ...(options.transformation ? { transformation: options.transformation } : {}),
    };
    const toSign = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');
    const signature = createHash('sha1')
      .update(toSign + apiSecret)
      .digest('hex');

    const form = new FormData();
    for (const [key, value] of Object.entries(params)) form.append(key, value);
    form.append('api_key', apiKey);
    form.append('signature', signature);
    form.append('file', new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }), file.originalname ?? 'upload');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) {
      this.logger.error(`Cloudinary upload failed (${res.status}): ${await res.text()}`);
      throw new InternalServerException('Could not upload the image', 'UPLOAD_FAILED');
    }

    const body = (await res.json()) as CloudinaryUploadResult;
    return body.secure_url;
  }
}
