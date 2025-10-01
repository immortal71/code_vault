import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors.js';
import { handleError, unauthorized } from '../_lib/errors.js';
import { requireAuth } from '../_lib/jwt.js';
import { validateBody } from '../_lib/validate.js';
import { explainCode } from '../../server/services/openaiService.js';
import { z } from 'zod';

const explainSchema = z.object({
  code: z.string(),
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
    const { code, language } = validateBody(req, explainSchema);

    // Explain code using OpenAI
    const explanation = await explainCode(code, language);

    return res.status(200).json({ explanation });
  } catch (error) {
    handleError(res, error);
  }
}
