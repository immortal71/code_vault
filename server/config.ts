import { z } from 'zod';
import { logger, configureLogger } from './logger';

const envSchemaBase = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Server configuration
  PORT: z.string().default('5000').transform((val) => {
    const port = Number(val);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error('PORT must be a valid port number (1-65535)');
    }
    return port;
  }),
  
  // Database configuration
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required').refine(
    (val) => val.startsWith('postgres://') || val.startsWith('postgresql://'),
    'DATABASE_URL must be a valid PostgreSQL URL (postgres:// or postgresql://)'
  ),
  PGHOST: z.string().optional(),
  PGPORT: z.string().optional(),
  PGUSER: z.string().optional(),
  PGPASSWORD: z.string().optional(),
  PGDATABASE: z.string().optional(),
  
  // Session configuration
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  
  // OpenAI configuration
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required for AI features'),
  
  // Production-specific configuration
  ALLOWED_ORIGINS: z.string().optional().transform((val) => {
    if (!val) return null;
    return val.split(',').map(o => o.trim()).filter(Boolean);
  }),
  
  // Optional configuration
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
});

const envSchema = envSchemaBase.superRefine((data, ctx) => {
  // Validate ALLOWED_ORIGINS is required in production
  if (data.NODE_ENV === 'production' && !data.ALLOWED_ORIGINS) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['ALLOWED_ORIGINS'],
      message: 'ALLOWED_ORIGINS is required in production (comma-separated list of allowed origins)',
    });
  }
});

export type AppConfig = z.infer<typeof envSchema>;

let config: AppConfig;

export function validateConfig(): AppConfig {
  try {
    config = envSchema.parse(process.env);
    
    // Configure logger with validated config
    const logLevel = config.LOG_LEVEL || (config.NODE_ENV === 'production' ? 'info' : 'debug');
    configureLogger(config.NODE_ENV, logLevel);
    
    // Log configuration (without sensitive values)
    logger.info({
      environment: config.NODE_ENV,
      port: config.PORT,
      logLevel,
      hasDatabase: !!config.DATABASE_URL,
      hasSessionSecret: !!config.SESSION_SECRET,
      hasOpenAiKey: !!config.OPENAI_API_KEY,
      allowedOrigins: config.ALLOWED_ORIGINS || ['*'],
    }, 'Application configuration validated');
    
    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error({ errors: error.errors }, 'Invalid environment configuration');
      
      console.error('\n❌ Environment Configuration Error:\n');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\nPlease check your environment variables and try again.\n');
      
      process.exit(1);
    }
    throw error;
  }
}

export function getConfig(): AppConfig {
  if (!config) {
    throw new Error('Configuration not initialized. Call validateConfig() first.');
  }
  return config;
}
