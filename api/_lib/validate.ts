import type { VercelRequest } from '@vercel/node';
import { z, ZodSchema } from 'zod';

export function validateBody<T>(
  req: VercelRequest,
  schema: ZodSchema<T>
): T {
  return schema.parse(req.body);
}

export function validateQuery<T>(
  req: VercelRequest,
  schema: ZodSchema<T>
): T {
  return schema.parse(req.query);
}

export function validateParams<T>(
  params: Record<string, any>,
  schema: ZodSchema<T>
): T {
  return schema.parse(params);
}
