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

export interface ExecutiveFeedback {
  executiveId: string;
  executiveName: string;
  score: number;
  feedback: string;
  methodology: string;
}

export interface BossResponse {
  executiveId: string;
  question: string;
  answer: string;
}

export interface RoundScore {
  diagnosisClarity: number;
  financialCoherence: number;
  executionRobustness: number;
  storytellingQuality: number;
  total: number;
  feedback: string;
  executiveFeedback?: ExecutiveFeedback[];
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

export type Difficulty = "iniciante" | "intermediario" | "avancado";

export interface GuestProfile {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  createdAt: string;
}

export interface GameSession {
  id: string;
  odidUserId?: string;
  guestProfileId?: string;
  mode: "solo";
  playerCount: number;
  difficulty: Difficulty;
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

export const guestProfiles = pgTable("guest_profiles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  company: varchar("company").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gameSessions = pgTable("game_sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  guestProfileId: varchar("guest_profile_id", { length: 36 }).references(() => guestProfiles.id),
  mode: text("mode").notNull().default("solo"),
  playerCount: integer("player_count").notNull().default(1),
  difficulty: text("difficulty").notNull().default("iniciante"),
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

export const guestProfilesRelations = relations(guestProfiles, ({ many }) => ({
  gameSessions: many(gameSessions),
}));

export const gameSessionsRelations = relations(gameSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [gameSessions.userId],
    references: [users.id],
  }),
  guestProfile: one(guestProfiles, {
    fields: [gameSessions.guestProfileId],
    references: [guestProfiles.id],
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

export const createGuestProfileSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  company: z.string().min(1, "Empresa é obrigatória"),
});

export const createSessionSchema = z.object({
  mode: z.enum(["solo"]).default("solo"),
  playerCount: z.number().min(1).max(1).default(1),
  difficulty: z.enum(["iniciante", "intermediario", "avancado"]),
  guestProfileId: z.string().optional(),
});

export const updateRoundResponseSchema = z.object({
  sessionId: z.string(),
  roundId: z.string(),
  step: z.enum(["diagnosis", "decision", "execution", "storytelling", "complete"]),
  response: z.record(z.string(), z.string()),
});

export type CreateGuestProfile = z.infer<typeof createGuestProfileSchema>;
export type CreateSession = z.infer<typeof createSessionSchema>;
export type UpdateRoundResponse = z.infer<typeof updateRoundResponseSchema>;
export type GuestProfileSelect = typeof guestProfiles.$inferSelect;
