import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_lib/db';
import { users } from '../../shared/schema';
import { setCorsHeaders } from '../_lib/cors';
import { handleError, badRequest, conflict } from '../_lib/errors';
import { validateBody } from '../_lib/validate';
import { hashPassword, generateAccessToken, generateRefreshToken, hashRefreshToken, setRefreshTokenCookie } from '../_lib/jwt';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
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
    const { username, password } = validateBody(req, registerSchema);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      throw conflict('Username already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        password: passwordHash,
      })
      .returning();

    // Generate tokens
    const accessToken = generateAccessToken({ userId: newUser.id, username: newUser.username });
    const { token: refreshToken, jti, expiresAt } = generateRefreshToken({ userId: newUser.id, username: newUser.username });

    // Hash and store refresh token
    const refreshTokenHash = await hashRefreshToken(refreshToken);
    await db
      .update(users)
      .set({
        refreshTokenHash,
        refreshTokenJti: jti,
        refreshTokenExpiresAt: expiresAt,
      })
      .where(eq(users.id, newUser.id));

    // Set refresh token as httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    // Return access token and user info
    res.status(201).json({
      accessToken,
      user: {
        id: newUser.id,
        username: newUser.username,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
}
