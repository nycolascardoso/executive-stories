import { z } from "zod";
import { sql } from "drizzle-orm";
import { pgTable, text, serial, integer, jsonb, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export type DeckType = "C" | "E" | "F" | "P" | "G" | "S";

export interface Card {
  id: string;
  deckType: DeckType;
  name: string;
  situation: string;
  challenge: string;
}

export interface DrawnCards {
  context: Card;
  strategy: Card;
  finance: Card;
  project: Card;
  governance: Card;
  storytelling: Card;
}

export interface DiagnosisResponse {
  contextDescription: string;
  mainRisks: string;
  opportunities: string;
}

export interface DecisionResponse {
  strategicDecisions: string;
  financialIndicators: string;
  scenarios: string;
}

export interface ExecutionResponse {
  initiatives: string;
  riskMitigation: string;
}

export interface StorytellingResponse {
  presentation: string;
}

export interface RoundResponse {
  diagnosis?: DiagnosisResponse;
  decision?: DecisionResponse;
  execution?: ExecutionResponse;
  storytelling?: StorytellingResponse;
}

export interface RoundScore {
  diagnosisClarity: number;
  financialCoherence: number;
  executionRobustness: number;
  storytellingQuality: number;
  total: number;
  feedback: string;
}

export type GameStep = "cards" | "diagnosis" | "decision" | "execution" | "storytelling" | "complete";

export interface GameRound {
  id: string;
  roundNumber: number;
  cards: DrawnCards;
  response: RoundResponse;
  score?: RoundScore;
  completedAt?: string;
  currentStep: GameStep;
}

export interface GameSession {
  id: string;
  odidUserId?: string;
  mode: "solo" | "group";
  playerCount: number;
  difficulty?: "easy" | "medium" | "hard";
  rounds: GameRound[];
  createdAt: string;
  updatedAt: string;
}

export const authSessions = pgTable(
  "auth_sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gameSessions = pgTable("game_sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  mode: text("mode").notNull().default("solo"),
  playerCount: integer("player_count").notNull().default(1),
  difficulty: text("difficulty").default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rounds = pgTable("rounds", {
  id: varchar("id", { length: 36 }).primaryKey(),
  sessionId: varchar("session_id", { length: 36 }).notNull().references(() => gameSessions.id),
  roundNumber: integer("round_number").notNull(),
  cards: jsonb("cards").notNull(),
  response: jsonb("response").notNull().default({}),
  score: jsonb("score"),
  currentStep: text("current_step").notNull().default("cards"),
  completedAt: timestamp("completed_at"),
});

export const usersRelations = relations(users, ({ many }) => ({
  gameSessions: many(gameSessions),
}));

export const gameSessionsRelations = relations(gameSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [gameSessions.userId],
    references: [users.id],
  }),
  rounds: many(rounds),
}));

export const roundsRelations = relations(rounds, ({ one }) => ({
  session: one(gameSessions, {
    fields: [rounds.sessionId],
    references: [gameSessions.id],
  }),
}));

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Session = typeof gameSessions.$inferSelect;
export type Round = typeof rounds.$inferSelect;

export const createSessionSchema = z.object({
  mode: z.enum(["solo", "group"]),
  playerCount: z.number().min(1).max(10).default(1),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

export const updateRoundResponseSchema = z.object({
  sessionId: z.string(),
  roundId: z.string(),
  step: z.enum(["diagnosis", "decision", "execution", "storytelling"]),
  response: z.record(z.string(), z.string()),
});

export type CreateSession = z.infer<typeof createSessionSchema>;
export type UpdateRoundResponse = z.infer<typeof updateRoundResponseSchema>;
