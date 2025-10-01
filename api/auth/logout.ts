import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_lib/db.js';
import { users } from '../../shared/schema.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { handleError, unauthorized } from '../_lib/errors.js';
import { requireAuth, clearRefreshTokenCookie } from '../_lib/jwt.js';
import { eq } from 'drizzle-orm';

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

    // Clear refresh token from database
    await db
      .update(users)
      .set({
        refreshTokenHash: null,
        refreshTokenJti: null,
        refreshTokenExpiresAt: null,
      })
      .where(eq(users.id, payload.userId));

    // Clear refresh token cookie
    clearRefreshTokenCookie(res);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    handleError(res, error);
  }
}
