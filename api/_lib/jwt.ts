import jwt from 'jsonwebtoken';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const scryptAsync = promisify(scrypt);

// JWT Configuration - Enforce required secrets
if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error('JWT_SECRET and REFRESH_TOKEN_SECRET environment variables are required');
}

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const JWT_ISSUER = 'code-snippet-manager';
const JWT_AUDIENCE = 'code-snippet-manager-api';

export interface TokenPayload {
  userId: string;
  username: string;
}

export interface RefreshTokenPayload extends TokenPayload {
  jti: string; // JWT ID for rotation
}

// Generate Access Token
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: 'HS256',
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    subject: payload.userId,
  });
}

// Generate Refresh Token with JTI
export function generateRefreshToken(payload: TokenPayload): { token: string; jti: string; expiresAt: Date } {
  const jti = randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const token = jwt.sign({ ...payload, jti }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    algorithm: 'HS256',
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    subject: payload.userId,
  });
  return { token, jti, expiresAt };
}

// Hash Password using scrypt (for user registration)
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// Compare Password with hash (timing-safe)
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    const parts = hash.split('.');
    if (parts.length !== 2) return false;
    
    const [hashedPassword, salt] = parts;
    const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex');
    const suppliedBuf = (await scryptAsync(password, salt, 64)) as Buffer;
    
    if (hashedPasswordBuf.length !== suppliedBuf.length) return false;
    
    return timingSafeEqual(hashedPasswordBuf, suppliedBuf);
  } catch (error) {
    return false;
  }
}

// Verify Access Token
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Verify Refresh Token
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as RefreshTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Hash refresh token for storage (using scrypt)
export async function hashRefreshToken(token: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(token, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// Compare refresh token with hash (timing-safe)
export async function compareRefreshToken(token: string, hash: string): Promise<boolean> {
  try {
    const parts = hash.split('.');
    if (parts.length !== 2) return false;
    
    const [hashedToken, salt] = parts;
    const hashedTokenBuf = Buffer.from(hashedToken, 'hex');
    const suppliedBuf = (await scryptAsync(token, salt, 64)) as Buffer;
    
    if (hashedTokenBuf.length !== suppliedBuf.length) return false;
    
    return timingSafeEqual(hashedTokenBuf, suppliedBuf);
  } catch (error) {
    return false;
  }
}

// Set Refresh Token Cookie (only refresh token uses cookies)
export function setRefreshTokenCookie(res: VercelResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = isProduction ? 'Secure;' : '';
  res.setHeader('Set-Cookie', 
    `refreshToken=${token}; HttpOnly; ${secure} SameSite=Strict; Path=/api/auth; Max-Age=604800` // 7 days
  );
}

// Clear Refresh Token Cookie
export function clearRefreshTokenCookie(res: VercelResponse): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = isProduction ? 'Secure;' : '';
  res.setHeader('Set-Cookie',
    `refreshToken=; HttpOnly; ${secure} SameSite=Strict; Path=/api/auth; Max-Age=0`
  );
}

// Get Token from Cookie
export function getTokenFromCookie(req: VercelRequest, cookieName: string): string | null {
  const cookies = req.headers.cookie;
  if (!cookies) return null;

  const cookie = cookies.split(';').find(c => c.trim().startsWith(`${cookieName}=`));
  if (!cookie) return null;

  return cookie.split('=')[1];
}

// Get Access Token from Authorization Header
export function getAccessTokenFromHeader(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer' || !token) return null;

  return token;
}

// Middleware: Require Authentication (reads from Authorization header)
export function requireAuth(req: VercelRequest): TokenPayload | null {
  const token = getAccessTokenFromHeader(req);
  if (!token) return null;

  return verifyAccessToken(token);
}

// Rotate Refresh Token (for refresh endpoint)
export interface RotateRefreshTokenResult {
  newAccessToken: string;
  newRefreshToken: string;
  newJti: string;
}

export async function rotateRefreshToken(
  oldRefreshToken: string,
  storedHashedToken: string,
  userId: string,
  username: string
): Promise<RotateRefreshTokenResult | null> {
  // Verify old refresh token
  const decoded = verifyRefreshToken(oldRefreshToken);
  if (!decoded || decoded.userId !== userId) return null;

  // Compare with stored hash
  const isValid = await compareRefreshToken(oldRefreshToken, storedHashedToken);
  if (!isValid) return null;

  // Generate new tokens
  const payload: TokenPayload = { userId, username };
  const newAccessToken = generateAccessToken(payload);
  const { token: newRefreshToken, jti: newJti } = generateRefreshToken(payload);

  return {
    newAccessToken,
    newRefreshToken,
    newJti,
  };
}
