import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import aiRoutes from "./routes/ai";
import snippetRoutes from "./routes/snippets";
import healthRoutes from "./routes/health";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoints (liveness and readiness probes)
  app.use("/api", healthRoutes);
  
  // AI routes for code analysis and embeddings
  app.use("/api/ai", aiRoutes);
  
  // Snippet CRUD and search routes
  app.use("/api/snippets", snippetRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
