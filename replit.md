# Code Snippet Manager

## Overview

A modern, AI-powered code snippet manager designed for developers to save, organize, search, and share code snippets with intelligent features. The application provides a clean, developer-focused interface with Monaco Editor integration for syntax highlighting and code editing.

**Key Features:**
- Organize code snippets with collections, tags, and favorites
- Monaco Editor integration for VS Code-like editing experience
- Search functionality with filtering by language and tags
- Dashboard with statistics and language distribution visualization
- Dark/light theme support with system preference detection

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
- In-memory storage implementation (MemStorage class) for development
- Prepared for database integration via IStorage interface
- User model with username/password authentication structure

### Database Design

**ORM & Schema:**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the target database (Neon serverless-compatible)
- Schema-first approach with Drizzle-Zod integration for validation

**Current Schema:**
- Users table with UUID primary keys, username (unique), and password fields
- Designed for extension with snippets, collections, tags, and favorites tables

**Migration Strategy:**
- Drizzle Kit for schema migrations (push command configured)
- Migrations stored in `/migrations` directory
- Database URL configuration via environment variables

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

**Planned Integrations:**
- OpenAI API for code analysis, auto-tagging, and semantic search (referenced in design documents)
- Vector storage for AI-powered snippet similarity (future enhancement)