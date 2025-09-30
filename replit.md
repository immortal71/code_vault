# Code Snippet Manager

## Overview

A modern, AI-powered code snippet manager designed for developers to save, organize, search, and share code snippets with intelligent features. The application provides a clean, developer-focused interface with Monaco Editor integration for syntax highlighting and code editing.

**Key Features:**
- AI-powered auto-tagging and code analysis using OpenAI GPT-4
- Semantic search with vector embeddings for intelligent snippet discovery
- Organize code snippets with collections, tags, and favorites
- Monaco Editor integration for VS Code-like editing experience
- Persistent PostgreSQL database with Drizzle ORM
- Dashboard with statistics and language distribution visualization
- Dark/light theme support with system preference detection

## Recent Changes

**September 30, 2025 - Production-Ready Release:**
- ✅ **Real Authentication System**: Secure password hashing with scrypt+salt, session-based auth, login/register/logout endpoints
- ✅ **Security Hardening**: Helmet CSP, CORS, rate limiting (global + AI endpoints), request size limits, trust proxy configuration
- ✅ **Structured Logging**: Pino logger with request IDs, sensitive data redaction, environment-aware configuration
- ✅ **Production Config**: Centralized config management, comprehensive Zod validation, health check endpoints
- ✅ **Database Optimization**: Composite per-user indexes, database-level search limits, deterministic ordering
- ✅ **Input Validation**: Comprehensive Zod schemas for all endpoints with proper 400 error handling
- ✅ **AI Features**: OpenAI GPT-4 auto-tagging, semantic search with vector embeddings (text-embedding-3-small)
- ✅ **Frontend Integration**: Complete auth UI with route guards, protected pages, React Query integration
- 🚀 **Status**: Production-ready with monitoring, security, and performance optimizations

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type safety
- Vite as the build tool for fast development and optimized production builds
- Client-side routing using Wouter (lightweight React Router alternative)

**UI Component System:**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Theme system supporting dark/light modes with CSS variables
- Monaco Editor (@monaco-editor/react) for code editing with syntax highlighting

**State Management:**
- React Query (@tanstack/react-query) for server state management and caching
- Local React state for UI interactions
- Form handling with React Hook Form and Zod validation

**Design Philosophy:**
- Developer-first interface inspired by Linear, Raycast, Arc Browser, and GitHub
- Consistent spacing using Tailwind units (8px increments)
- Inter font for UI, Fira Code/Monaco for code display
- Subtle animations using CSS transitions (no external animation library currently integrated)

### Backend Architecture

**Server Framework:**
- Express.js for REST API endpoints
- TypeScript for type safety across the stack
- Session-based architecture (connect-pg-simple for PostgreSQL session store)

**Development Environment:**
- Custom Vite integration for development with HMR
- Middleware-based request/response logging
- Error handling middleware for consistent API responses

**Data Layer:**
- PostgreSQL persistent storage via DatabaseStorage class
- IStorage interface for abstraction and testability
- Secure authentication with scrypt password hashing
- Session-based auth with PostgreSQL session store
- Protected API routes with ownership enforcement

**Production Infrastructure:**
- **Security Middleware**: Helmet CSP (environment-aware), HSTS, CORS with validated origins
- **Rate Limiting**: Global (100 req/15min) and AI-specific (20 req/15min) rate limiters
- **Request Size Limits**: 1MB body limit, 100KB code snippet limit
- **Trust Proxy**: Configured for accurate client IP behind load balancers
- **Structured Logging**: Pino with request IDs, sensitive data redaction
- **Error Handling**: Centralized error handler with consistent JSON responses
- **Health Checks**: /api/health/live (liveness) and /api/health/ready (database readiness)
- **Configuration**: Environment-based config with comprehensive Zod validation

### Database Design

**ORM & Schema:**
- Drizzle ORM for type-safe database operations
- PostgreSQL (Neon serverless) for production
- Schema-first approach with Drizzle-Zod integration for validation

**Current Schema:**
- Users table: UUID primary keys, username (unique), password (scrypt hashed)
- Snippets table: UUID primary keys, title, code, language, tags, framework, complexity, userId foreign key
- Collections table: User-created snippet collections
- Embeddings: Vector embeddings (JSON) for semantic search
- Security: All snippets scoped to userId with server-side ownership enforcement

**Performance Optimization:**
- **Composite Indexes**: Per-user indexes on (userId, createdAt), (userId, language), (userId, isFavorite), (userId, lastUsedAt)
- **Database-Level Limits**: Search queries use SQL LIMIT clause (no in-memory filtering)
- **Deterministic Ordering**: All queries include ORDER BY for consistent results
- **Semantic Search**: Limited to 1000 most recent snippets, returns top 50 by cosine similarity
- **Keyword Search**: Database-limited to 100 results with ORDER BY createdAt DESC

**Migration Strategy:**
- Drizzle Kit for schema migrations (push command)
- Migrations stored in `/migrations` directory
- DATABASE_URL environment variable for connection
- Auto-sync schema on server startup

### External Dependencies

**Database & Infrastructure:**
- Neon Serverless PostgreSQL (@neondatabase/serverless) with WebSocket support
- Connection pooling for production scalability
- Environment-based configuration (DATABASE_URL required)

**UI Libraries:**
- Radix UI primitives for accessible components (dialogs, dropdowns, tooltips, etc.)
- Recharts for data visualization (language distribution pie chart)
- Lucide React for icons
- React Icons (Simple Icons) for technology logos
- CMDK for command palette functionality

**Development Tools:**
- Replit-specific plugins for development experience (cartographer, dev-banner, runtime error overlay)
- TypeScript with strict mode enabled
- Path aliases configured (@/ for client, @shared for shared code)

**AI Integrations:**
- OpenAI GPT-4 for code analysis, explanation, and auto-tagging
- OpenAI text-embedding-3-small for semantic search with vector embeddings
- Cosine similarity algorithm for finding related snippets
- Server-side embedding generation with automatic caching