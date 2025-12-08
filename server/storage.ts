import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  users, 
  gameSessions, 
  rounds,
  type User,
  type UpsertUser,
  type GameSession, 
  type GameRound, 
  type DrawnCards,
  type RoundResponse,
  type RoundScore,
  type CreateSession,
  type GameStep
} from "@shared/schema";
import { drawRandomCards } from "@shared/cardData";
import { evaluateResponseWithAI } from "./aiService";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createSession(data: CreateSession, userId?: string): Promise<GameSession>;
  getSession(id: string): Promise<GameSession | undefined>;
  getAllSessions(userId?: string): Promise<GameSession[]>;
  getUserStats(userId: string): Promise<{ totalRounds: number; avgScore: number; bestScore: number; roundsCompleted: number }>;
  createRound(sessionId: string): Promise<GameRound | undefined>;
  updateRound(sessionId: string, roundId: string, step: string, response: Record<string, string>): Promise<GameRound | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createSession(data: CreateSession, userId?: string): Promise<GameSession> {
    const id = randomUUID();
    const now = new Date();

    await db.insert(gameSessions).values({
      id,
      userId: userId || null,
      mode: data.mode,
      playerCount: data.playerCount || 1,
      difficulty: data.difficulty || "medium",
      createdAt: now,
      updatedAt: now,
    });

    return {
      id,
      odidUserId: userId,
      mode: data.mode,
      playerCount: data.playerCount || 1,
      difficulty: data.difficulty || "medium",
      rounds: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  async getSession(id: string): Promise<GameSession | undefined> {
    const [session] = await db.select().from(gameSessions).where(eq(gameSessions.id, id));
    if (!session) return undefined;

    const sessionRounds = await db
      .select()
      .from(rounds)
      .where(eq(rounds.sessionId, id))
      .orderBy(rounds.roundNumber);

    const gameRounds: GameRound[] = sessionRounds.map(r => ({
      id: r.id,
      roundNumber: r.roundNumber,
      cards: r.cards as DrawnCards,
      response: (r.response || {}) as RoundResponse,
      score: r.score as RoundScore | undefined,
      currentStep: r.currentStep as GameStep,
      completedAt: r.completedAt?.toISOString(),
    }));

    return {
      id: session.id,
      odidUserId: session.userId || undefined,
      mode: session.mode as "solo" | "group",
      playerCount: session.playerCount,
      difficulty: session.difficulty as "easy" | "medium" | "hard" | undefined,
      rounds: gameRounds,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  }

  async getAllSessions(userId?: string): Promise<GameSession[]> {
    let query;
    if (userId) {
      query = await db.select().from(gameSessions).where(eq(gameSessions.userId, userId));
    } else {
      query = await db.select().from(gameSessions);
    }

    const allSessions: GameSession[] = [];
    for (const session of query) {
      const sessionRounds = await db
        .select()
        .from(rounds)
        .where(eq(rounds.sessionId, session.id))
        .orderBy(rounds.roundNumber);

      const gameRounds: GameRound[] = sessionRounds.map(r => ({
        id: r.id,
        roundNumber: r.roundNumber,
        cards: r.cards as DrawnCards,
        response: (r.response || {}) as RoundResponse,
        score: r.score as RoundScore | undefined,
        currentStep: r.currentStep as GameStep,
        completedAt: r.completedAt?.toISOString(),
      }));

      allSessions.push({
        id: session.id,
        odidUserId: session.userId || undefined,
        mode: session.mode as "solo" | "group",
        playerCount: session.playerCount,
        difficulty: session.difficulty as "easy" | "medium" | "hard" | undefined,
        rounds: gameRounds,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
      });
    }

    return allSessions;
  }

  async getUserStats(userId: string): Promise<{ totalRounds: number; avgScore: number; bestScore: number; roundsCompleted: number }> {
    const userSessions = await this.getAllSessions(userId);
    
    let totalRounds = 0;
    let roundsCompleted = 0;
    let totalScore = 0;
    let bestScore = 0;

    for (const session of userSessions) {
      for (const round of session.rounds) {
        totalRounds++;
        if (round.currentStep === "complete" && round.score) {
          roundsCompleted++;
          totalScore += round.score.total;
          if (round.score.total > bestScore) {
            bestScore = round.score.total;
          }
        }
      }
    }

    return {
      totalRounds,
      roundsCompleted,
      avgScore: roundsCompleted > 0 ? Math.round((totalScore / roundsCompleted) * 10) / 10 : 0,
      bestScore,
    };
  }

  async createRound(sessionId: string): Promise<GameRound | undefined> {
    const session = await this.getSession(sessionId);
    if (!session) return undefined;

    const roundNumber = session.rounds.length + 1;
    const cards = drawRandomCards(session.difficulty);
    const id = randomUUID();

    await db.insert(rounds).values({
      id,
      sessionId,
      roundNumber,
      cards,
      response: {},
      currentStep: "cards",
    });

    await db
      .update(gameSessions)
      .set({ updatedAt: new Date() })
      .where(eq(gameSessions.id, sessionId));

    return {
      id,
      roundNumber,
      cards,
      response: {},
      currentStep: "cards",
    };
  }

  async updateRound(
    sessionId: string,
    roundId: string,
    step: string,
    response: Record<string, string>
  ): Promise<GameRound | undefined> {
    const [existingRound] = await db.select().from(rounds).where(eq(rounds.id, roundId));
    if (!existingRound || existingRound.sessionId !== sessionId) return undefined;

    const round: GameRound = {
      id: existingRound.id,
      roundNumber: existingRound.roundNumber,
      cards: existingRound.cards as DrawnCards,
      response: (existingRound.response || {}) as RoundResponse,
      score: existingRound.score as RoundScore | undefined,
      currentStep: existingRound.currentStep as GameStep,
      completedAt: existingRound.completedAt?.toISOString(),
    };

    const stepOrder = ["cards", "diagnosis", "decision", "execution", "storytelling", "complete"];
    const currentIndex = stepOrder.indexOf(round.currentStep);
    const nextIndex = stepOrder.indexOf(step);

    const isDirectCompletion = round.currentStep === "cards" && step === "complete";
    if (nextIndex < 0 || (!isDirectCompletion && nextIndex > currentIndex + 1)) {
      return round;
    }

    const sanitize = (value: unknown): string => {
      if (typeof value === 'string') return value.trim();
      return '';
    };

    if (round.currentStep === "cards" && step === "complete") {
      const diagText = sanitize(response.diagnostico);
      round.response.diagnosis = {
        contextDescription: diagText,
        mainRisks: "",
        opportunities: "",
      };
      const decText = sanitize(response.decisoes);
      round.response.decision = {
        strategicDecisions: decText,
        financialIndicators: "",
        scenarios: "",
      };
      const execText = sanitize(response.execucao);
      round.response.execution = {
        initiatives: execText,
        riskMitigation: "",
      };
      round.response.storytelling = {
        presentation: sanitize(response.storytelling),
      };
      if (response.bossResponses) {
        try {
          (round.response as any).boss = JSON.parse(response.bossResponses);
        } catch {
          (round.response as any).boss = response.bossResponses;
        }
      }
    } else {
      switch (round.currentStep) {
        case "cards":
          break;
        case "diagnosis":
          round.response.diagnosis = {
            contextDescription: sanitize(response.contextDescription),
            mainRisks: sanitize(response.mainRisks),
            opportunities: sanitize(response.opportunities),
          };
          break;
        case "decision":
          round.response.decision = {
            strategicDecisions: sanitize(response.strategicDecisions),
            financialIndicators: sanitize(response.financialIndicators),
            scenarios: sanitize(response.scenarios),
          };
          break;
        case "execution":
          round.response.execution = {
            initiatives: sanitize(response.initiatives),
            riskMitigation: sanitize(response.riskMitigation),
          };
          break;
        case "storytelling":
          round.response.storytelling = {
            presentation: sanitize(response.presentation),
          };
          break;
      }
    }

    round.currentStep = step as GameStep;

    let completedAt: Date | null = null;
    if (step === "complete") {
      completedAt = new Date();
      round.completedAt = completedAt.toISOString();
      try {
        round.score = await evaluateResponseWithAI(round.response, round.cards);
      } catch (error) {
        console.error("AI evaluation failed in updateRound:", error);
        round.score = {
          diagnosisClarity: 1,
          financialCoherence: 1,
          executionRobustness: 1,
          storytellingQuality: 1,
          total: 4,
          feedback: "Avaliação automática. A análise completa da IA não está disponível no momento.",
        };
      }
    }

    await db
      .update(rounds)
      .set({
        response: round.response,
        currentStep: round.currentStep,
        score: round.score || null,
        completedAt,
      })
      .where(eq(rounds.id, roundId));

    await db
      .update(gameSessions)
      .set({ updatedAt: new Date() })
      .where(eq(gameSessions.id, sessionId));

    return round;
  }
}

export const storage = new DatabaseStorage();
