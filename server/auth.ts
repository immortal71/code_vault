import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { User as SelectUser, registerSchema, loginSchema } from "@shared/schema";
import { ZodError } from "zod";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Validate SESSION_SECRET exists and has sufficient entropy
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error('SESSION_SECRET environment variable is required for authentication');
  }
  if (sessionSecret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters for production security');
  }

  // Rate limiter for auth endpoints to prevent brute force
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Stricter rate limiter for login to prevent credential stuffing
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    skipSuccessfulRequests: true, // Don't count successful logins
    message: 'Too many login attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });

  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    }
  };

  if (process.env.NODE_ENV === 'production') {
    app.set("trust proxy", 1);
  }
  
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: 'Invalid username or password' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", authLimiter, async (req, res, next) => {
    try {
      // Validate input with Zod schema
      const validatedData = registerSchema.parse(req.body);
      const { username, password } = validatedData;

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        // Generic error to prevent username enumeration
        return res.status(400).json({ error: 'Registration failed. Please try a different username.' });
      }

      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
      });

      // Regenerate session to prevent session fixation
      req.session.regenerate((err) => {
        if (err) return next(err);
        
        req.login(user, (err) => {
          if (err) return next(err);
          const { password: _, ...userWithoutPassword } = user;
          res.status(201).json(userWithoutPassword);
        });
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      next(error);
    }
  });

  app.post("/api/login", loginLimiter, (req, res, next) => {
    try {
      // Validate input with Zod schema
      loginSchema.parse(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
    }

    passport.authenticate("local", (err: Error, user: SelectUser, info: { message: string }) => {
      if (err) return next(err);
      if (!user) {
        // Generic error to prevent timing attacks and user enumeration
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Regenerate session to prevent session fixation
      req.session.regenerate((err) => {
        if (err) return next(err);
        
        req.login(user, (err) => {
          if (err) return next(err);
          const { password: _, ...userWithoutPassword } = user;
          res.status(200).json(userWithoutPassword);
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      
      // Destroy session completely
      req.session.destroy((err) => {
        if (err) return next(err);
        
        // Clear the session cookie
        res.clearCookie('connect.sid');
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const { password: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}
