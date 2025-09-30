import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_lib/db';
import { users } from '../../shared/schema';
import { setCorsHeaders } from '../_lib/cors';
import { handleError, unauthorized } from '../_lib/errors';
import { requireAuth } from '../_lib/jwt';
import { eq } from 'drizzle-orm';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Require authentication
    const payload = requireAuth(req);
    if (!payload) {
      throw unauthorized('Authentication required');
    }

    // Get user from database
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
      })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user) {
      throw unauthorized('User not found');
    }

    res.status(200).json({ user });
  } catch (error) {
    handleError(res, error);
  }
}
