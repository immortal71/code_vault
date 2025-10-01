import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_lib/db.js';
import { users } from '../../shared/schema.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { handleError, unauthorized } from '../_lib/errors.js';
import { validateBody } from '../_lib/validate.js';
import { comparePassword, generateAccessToken, generateRefreshToken, hashRefreshToken, setRefreshTokenCookie } from '../_lib/jwt.js';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
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
    // Validate request body
    const { username, password } = validateBody(req, loginSchema);

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      throw unauthorized('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw unauthorized('Invalid credentials');
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, username: user.username });
    const { token: refreshToken, jti, expiresAt } = generateRefreshToken({ userId: user.id, username: user.username });

    // Hash and store refresh token
    const refreshTokenHash = await hashRefreshToken(refreshToken);
    await db
      .update(users)
      .set({
        refreshTokenHash,
        refreshTokenJti: jti,
        refreshTokenExpiresAt: expiresAt,
      })
      .where(eq(users.id, user.id));

    // Set refresh token as httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    // Return access token and user info
    res.status(200).json({
      accessToken,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
}
