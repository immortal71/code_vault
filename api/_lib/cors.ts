import type { VercelRequest, VercelResponse } from '@vercel/node';

// Allowed origins based on environment
const getAllowedOrigins = (): Array<string | RegExp> => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.ALLOWED_ORIGINS?.split(',') || [];
  }
  // Development: allow localhost and Replit domains
  return [
    'http://localhost:5000',
    'http://localhost:3000',
    /https:\/\/.*\.replit\.dev$/,
  ];
};

export function setCorsHeaders(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin || '';
  const allowedOrigins = getAllowedOrigins();

  // Check if origin is allowed
  const isAllowed = allowedOrigins.some(allowed => {
    if (typeof allowed === 'string') {
      return allowed === origin;
    }
    if (allowed instanceof RegExp) {
      return allowed.test(origin);
    }
    return false;
  });

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
}
