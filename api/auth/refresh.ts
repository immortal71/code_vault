import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_lib/db';
import { users } from '../../shared/schema';
import { setCorsHeaders } from '../_lib/cors';
import { handleError, unauthorized } from '../_lib/errors';
import { getTokenFromCookie, verifyRefreshToken, compareRefreshToken, generateAccessToken, generateRefreshToken, hashRefreshToken, setRefreshTokenCookie } from '../_lib/jwt';
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
    // Get refresh token from cookie
    const refreshToken = getTokenFromCookie(req, 'refreshToken');
    if (!refreshToken) {
      throw unauthorized('Refresh token required');
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw unauthorized('Invalid refresh token');
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user || !user.refreshTokenHash || !user.refreshTokenJti) {
      throw unauthorized('Invalid refresh token');
    }

    // Verify JTI matches
    if (user.refreshTokenJti !== payload.jti) {
      throw unauthorized('Token has been rotated');
    }

    // Verify token is not expired
    if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) {
      throw unauthorized('Refresh token expired');
    }

    // Verify token hash matches
    const isValid = await compareRefreshToken(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      throw unauthorized('Invalid refresh token');
    }

    // Generate new tokens (rotation)
    const newAccessToken = generateAccessToken({ userId: user.id, username: user.username });
    const { token: newRefreshToken, jti: newJti, expiresAt: newExpiresAt } = generateRefreshToken({ userId: user.id, username: user.username });

    // Hash and store new refresh token
    const newRefreshTokenHash = await hashRefreshToken(newRefreshToken);
    await db
      .update(users)
      .set({
        refreshTokenHash: newRefreshTokenHash,
        refreshTokenJti: newJti,
        refreshTokenExpiresAt: newExpiresAt,
      })
      .where(eq(users.id, user.id));

    // Set new refresh token as httpOnly cookie
    setRefreshTokenCookie(res, newRefreshToken);

    // Return new access token
    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    handleError(res, error);
  }
}
