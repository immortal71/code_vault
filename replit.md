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

**September 30, 2025 - AI Features & Security Hardening:**
- ✅ Implemented AI-powered code analysis and auto-tagging using OpenAI GPT-4
- ✅ Added semantic search with vector embeddings (text-embedding-3-small)
- ✅ Migrated from in-memory to persistent PostgreSQL database
- ✅ Fixed critical security vulnerabilities:
  - Route order bug (search route collision fixed)
  - Unauthorized access prevention (ownership checks on all routes)
  - Server-side user ID enforcement (no client manipulation)
  - Privilege escalation prevention (field whitelisting on updates)
- ✅ Integrated real API endpoints with React Query
- ✅ Demo user auto-initialization on server startup
- ⚠️ Note: Not production-ready without real authentication system

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
- User model with UUID-based authentication
- Demo user automatically created on server startup

### Database Design

**ORM & Schema:**
- Drizzle ORM for type-safe database operations
- PostgreSQL (Neon serverless) for production
- Schema-first approach with Drizzle-Zod integration for validation

**Current Schema:**
- Users table: UUID primary keys, username (unique), password
- Snippets table: UUID primary keys, title, code, language, tags, framework, complexity, userId foreign key
- Embeddings: Vector embeddings stored as JSON for semantic search
- Security: All snippets scoped to userId with server-side ownership enforcement

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