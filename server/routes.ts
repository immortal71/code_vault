import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import aiRoutes from "./routes/ai";
import snippetRoutes from "./routes/snippets";

export async function registerRoutes(app: Express): Promise<Server> {
  // AI routes for code analysis and embeddings
  app.use("/api/ai", aiRoutes);
  
  // Snippet CRUD and search routes
  app.use("/api/snippets", snippetRoutes);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "AI-powered Snippet Manager API" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
