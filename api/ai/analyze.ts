import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors.js';
import { handleError, unauthorized, badRequest } from '../_lib/errors.js';
import { requireAuth } from '../_lib/jwt.js';
import { validateBody } from '../_lib/validate.js';
import { analyzeCode } from '../../server/services/openaiService.js';
import { z } from 'zod';

const analyzeSchema = z.object({
  code: z.string().max(10000, 'Code is too long (max 10,000 characters)'),
  language: z.string(),
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Require authentication
    const payload = requireAuth(req);
    if (!payload) {
      throw unauthorized('Authentication required');
    }

    // Validate request body
    const { code, language } = validateBody(req, analyzeSchema);

    // Analyze code using OpenAI
    const analysis = await analyzeCode(code, language);

    return res.status(200).json(analysis);
  } catch (error) {
    handleError(res, error);
  }
}
