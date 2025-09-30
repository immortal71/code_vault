import pino from 'pino';
import pinoHttp from 'pino-http';
import crypto from 'crypto';

export const logger = pino({
  level: 'debug', // Will be updated after config validation
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token', 'secret'],
    censor: '[REDACTED]',
  },
});

export function configureLogger(nodeEnv: string, logLevel: string) {
  // Set log level
  logger.level = logLevel;
  
  // Configure pretty printing for development
  if (nodeEnv !== 'production') {
    // Note: In production, pino outputs NDJSON for log aggregation
    // In development, we use the default pino output (no pretty transport needed at runtime)
  }
}

export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) {
      return 'error';
    } else if (res.statusCode >= 400) {
      return 'warn';
    }
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${err?.message}`;
  },
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'responseTime',
    reqId: 'requestId',
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        userAgent: req.headers['user-agent'],
      },
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
  genReqId: (req, res) => {
    const existingId = req.headers['x-request-id'];
    const requestId = Array.isArray(existingId) ? existingId[0] : existingId || crypto.randomUUID();
    res.setHeader('X-Request-Id', requestId);
    return requestId;
  },
  customProps: (req) => ({
    userId: (req as any).user?.id,
  }),
});
