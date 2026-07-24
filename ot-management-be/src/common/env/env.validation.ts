import * as Joi from 'joi';
import { ENV } from '@/utils/constants/env.const';

export const envValidationSchema = Joi.object({
  [ENV.PORT]: Joi.number().port().default(5000),
  [ENV.CORS_ORIGINS]: Joi.string().required(),
  [ENV.DB_HOST]: Joi.string().required(),
  [ENV.DB_PORT]: Joi.number().port().required(),
  [ENV.DB_USERNAME]: Joi.string().required(),
  [ENV.DB_PASSWORD]: Joi.string().allow('').required(),
  [ENV.DB_DATABASE]: Joi.string().required(),
  [ENV.JWT_ACCESS_SECRET]: Joi.string().required(),
  [ENV.JWT_ACCESS_EXPIRES_IN]: Joi.string().default('15m'),
  [ENV.JWT_REFRESH_SECRET]: Joi.string().required(),
  [ENV.JWT_REFRESH_EXPIRES_IN]: Joi.string().default('7d'),
  [ENV.MAIL_HOST]: Joi.string().allow('').optional(),
  [ENV.MAIL_PORT]: Joi.number().allow('').optional(),
  [ENV.MAIL_USER]: Joi.string().allow('').optional(),
  [ENV.MAIL_PASSWORD]: Joi.string().allow('').optional(),
  [ENV.MAIL_FROM]: Joi.string().allow('').optional(),
});
