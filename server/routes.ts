import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createSessionSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/sessions", async (req, res) => {
    try {
      const parsed = createSessionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsed.error });
      }

      const session = await storage.createSession(parsed.data);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.post("/api/sessions/:id/rounds", async (req, res) => {
    try {
      const round = await storage.createRound(req.params.id);
      if (!round) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(round);
    } catch (error) {
      console.error("Error creating round:", error);
      res.status(500).json({ error: "Failed to create round" });
    }
  });

  app.patch("/api/sessions/:sessionId/rounds/:roundId", async (req, res) => {
    try {
      const { sessionId, roundId } = req.params;
      const { step, response } = req.body;

      if (!step || typeof step !== "string") {
        return res.status(400).json({ error: "Missing or invalid step" });
      }

      const round = await storage.updateRound(sessionId, roundId, step, response || {});
      if (!round) {
        return res.status(404).json({ error: "Session or round not found" });
      }
      res.json(round);
    } catch (error) {
      console.error("Error updating round:", error);
      res.status(500).json({ error: "Failed to update round" });
    }
  });

  return httpServer;
}
