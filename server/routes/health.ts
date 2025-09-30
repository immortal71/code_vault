import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { logger } from '../logger';
import { getConfig } from '../config';

const router = Router();

// Liveness probe - checks if the service is running
router.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe - checks if the service is ready to handle traffic
router.get('/health/ready', async (req, res) => {
  const checks: { [key: string]: { status: string; latency?: number; error?: string } } = {};
  let isReady = true;

  // Check database connection
  const dbStart = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    checks.database = {
      status: 'ok',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    isReady = false;
    checks.database = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    logger.error({ err: error }, 'Database health check failed');
  }

  // Check OpenAI API (verify key exists from config)
  const config = getConfig();
  if (config.OPENAI_API_KEY) {
    checks.openai = {
      status: 'ok',
    };
  } else {
    checks.openai = {
      status: 'warning',
      error: 'OPENAI_API_KEY not configured',
    };
  }

  // Return appropriate status code
  const statusCode = isReady ? 200 : 503;
  
  res.status(statusCode).json({
    status: isReady ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    checks,
  });
});

export default router;
