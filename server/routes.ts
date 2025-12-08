import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createSessionSchema, createGuestProfileSchema, type GameSession, type GameRound } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { DECK_INFO } from "@shared/cardData";

function generateSessionReport(session: GameSession): string {
  const difficultyLabels: Record<string, string> = {
    iniciante: "Iniciante",
    intermediario: "Intermediário", 
    avancado: "Avançado"
  };
  
  let report = `
═══════════════════════════════════════════════════════════════════
                    EXECUTIVE STORIES - RELATÓRIO
═══════════════════════════════════════════════════════════════════

Sessão ID: ${session.id}
Modo: ${session.mode === "solo" ? "Solo" : "Grupo"}
Dificuldade: ${difficultyLabels[session.difficulty || "medium"]}
Data de Criação: ${new Date(session.createdAt).toLocaleString("pt-BR")}
Última Atualização: ${new Date(session.updatedAt).toLocaleString("pt-BR")}
Total de Rodadas: ${session.rounds.length}

`;

  session.rounds.forEach((round: GameRound, index: number) => {
    report += `
───────────────────────────────────────────────────────────────────
                         RODADA ${round.roundNumber}
───────────────────────────────────────────────────────────────────

CARTAS SORTEADAS:
`;
    
    const cardOrder = ["context", "strategy", "finance", "project", "governance", "storytelling"] as const;
    const deckLabels: Record<string, string> = {
      context: "Contexto",
      strategy: "Estratégia", 
      finance: "Finanças",
      project: "Projetos",
      governance: "Governança",
      storytelling: "Storytelling"
    };
    
    cardOrder.forEach(key => {
      const card = round.cards[key];
      if (card) {
        report += `
• ${deckLabels[key]} [${card.id}]: ${card.name}
  Situação: ${card.situation}
  Desafio: ${card.challenge}
`;
      }
    });

    if (round.response.diagnosis) {
      report += `
DIAGNÓSTICO:
  Descrição do Contexto: ${round.response.diagnosis.contextDescription || "-"}
  Principais Riscos: ${round.response.diagnosis.mainRisks || "-"}
  Oportunidades: ${round.response.diagnosis.opportunities || "-"}
`;
    }

    if (round.response.decision) {
      report += `
DECISÃO:
  Decisões Estratégicas: ${round.response.decision.strategicDecisions || "-"}
  Indicadores Financeiros: ${round.response.decision.financialIndicators || "-"}
  Cenários: ${round.response.decision.scenarios || "-"}
`;
    }

    if (round.response.execution) {
      report += `
EXECUÇÃO:
  Iniciativas: ${round.response.execution.initiatives || "-"}
  Mitigação de Riscos: ${round.response.execution.riskMitigation || "-"}
`;
    }

    if (round.response.storytelling) {
      report += `
STORYTELLING:
  Apresentação: ${round.response.storytelling.presentation || "-"}
`;
    }

    if (round.score) {
      report += `
PONTUAÇÃO:
  Clareza do Diagnóstico: ${round.score.diagnosisClarity}/3
  Coerência Financeira: ${round.score.financialCoherence}/3
  Robustez da Execução: ${round.score.executionRobustness}/3
  Qualidade do Storytelling: ${round.score.storytellingQuality}/3
  ─────────────────────────
  TOTAL: ${round.score.total}/12

FEEDBACK DO AVALIADOR:
${round.score.feedback}
`;
    }

    if (round.completedAt) {
      report += `
Rodada Concluída em: ${new Date(round.completedAt).toLocaleString("pt-BR")}
`;
    }
  });

  report += `
═══════════════════════════════════════════════════════════════════
                      FIM DO RELATÓRIO
═══════════════════════════════════════════════════════════════════
`;

  return report;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/auth/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.post("/api/guest-profiles", async (req, res) => {
    try {
      const parsed = createGuestProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsed.error });
      }
      const profile = await storage.createGuestProfile(parsed.data);
      res.json(profile);
    } catch (error) {
      console.error("Error creating guest profile:", error);
      res.status(500).json({ error: "Failed to create guest profile" });
    }
  });

  app.get("/api/guest-profiles/:id", async (req, res) => {
    try {
      const profile = await storage.getGuestProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Guest profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching guest profile:", error);
      res.status(500).json({ error: "Failed to fetch guest profile" });
    }
  });

  app.get("/api/guest-profiles/:id/stats", async (req, res) => {
    try {
      const stats = await storage.getGuestStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching guest stats:", error);
      res.status(500).json({ error: "Failed to fetch guest stats" });
    }
  });

  app.get("/api/guest-profiles/:id/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllSessions(undefined, req.params.id);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching guest sessions:", error);
      res.status(500).json({ error: "Failed to fetch guest sessions" });
    }
  });

  app.post("/api/sessions", async (req: any, res) => {
    try {
      const parsed = createSessionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsed.error });
      }

      const userId = req.user?.claims?.sub;
      const session = await storage.createSession(parsed.data, userId);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.get("/api/sessions", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const sessions = await storage.getAllSessions(userId);
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

  app.get("/api/sessions/:id/export", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const report = generateSessionReport(session);
      
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="executive-stories-session-${session.id.slice(0, 8)}.txt"`);
      res.send(report);
    } catch (error) {
      console.error("Error exporting session:", error);
      res.status(500).json({ error: "Failed to export session" });
    }
  });

  return httpServer;
}
