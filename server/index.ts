import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";
import { httpLogger, logger } from "./logger";

const app = express();

// Trust proxy for accurate client IP (required for rate limiting behind proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Disable X-Powered-By header
app.disable('x-powered-by');

// Security middleware - helmet with environment-aware CSP
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  }));
} else {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Required for Vite dev
        styleSrc: ["'self'", "'unsafe-inline'"], // Required for styled components
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:", "ws:"], // Required for Vite HMR
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
  }));
}

// CORS configuration with strict production validation
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (() => {
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',');
        if (!allowedOrigins || allowedOrigins.length === 0) {
          throw new Error('ALLOWED_ORIGINS environment variable is required in production');
        }
        return allowedOrigins;
      })()
    : true, // Allow all origins in development
  credentials: true,
};
app.use(cors(corsOptions));

// Compression for responses
app.use(compression());

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// Stricter rate limiting for AI endpoints (more expensive)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 AI requests per windowMs
  message: 'Too many AI requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/ai', aiLimiter);

// Request size limits to prevent DoS
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Validate request body size for snippet routes (POST/PUT/PATCH)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/snippets') && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const code = req.body?.code;
    if (code && Buffer.byteLength(code, 'utf8') > 102400) { // 100KB max for code snippets (measured in bytes)
      return res.status(413).json({ error: 'Code snippet is too large (max 100KB)' });
    }
  }
  next();
});

// Structured logging with request IDs
app.use(httpLogger);

(async () => {
  // Setup authentication before routes
  setupAuth(app);
  
  const server = await registerRoutes(app);

  // Centralized error handler
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error with context
    if (status >= 500) {
      logger.error({
        err,
        requestId: req.id,
        userId: (req as any).user?.id,
        method: req.method,
        url: req.url,
      }, 'Server error');
    } else {
      logger.warn({
        err: { message: err.message, status },
        requestId: req.id,
        userId: (req as any).user?.id,
        method: req.method,
        url: req.url,
      }, 'Client error');
    }

    // Send error response
    res.status(status).json({
      error: process.env.NODE_ENV === 'production' && status >= 500 
        ? 'Internal Server Error' 
        : message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
