import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from '../_lib/cors';
import { handleError, unauthorized } from '../_lib/errors';
import { requireAuth } from '../_lib/jwt';
import { validateBody } from '../_lib/validate';
import { generateEmbedding } from '../../server/services/openaiService';
import { z } from 'zod';

const embedSchema = z.object({
  text: z.string(),
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
    const { text } = validateBody(req, embedSchema);

    // Generate embedding using OpenAI
    const embedding = await generateEmbedding(text);

    return res.status(200).json({ embedding });
  } catch (error) {
    handleError(res, error);
  }
}
