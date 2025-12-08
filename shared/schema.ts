import { z } from "zod";

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

export interface GameRound {
  id: string;
  roundNumber: number;
  cards: DrawnCards;
  response: RoundResponse;
  score?: RoundScore;
  completedAt?: string;
  currentStep: "cards" | "diagnosis" | "decision" | "execution" | "storytelling" | "complete";
}

export interface GameSession {
  id: string;
  mode: "solo" | "group";
  playerCount: number;
  rounds: GameRound[];
  createdAt: string;
  updatedAt: string;
}

export const createSessionSchema = z.object({
  mode: z.enum(["solo", "group"]),
  playerCount: z.number().min(1).max(10).default(1),
});

export const updateRoundResponseSchema = z.object({
  sessionId: z.string(),
  roundId: z.string(),
  step: z.enum(["diagnosis", "decision", "execution", "storytelling"]),
  response: z.record(z.string(), z.string()),
});

export type CreateSession = z.infer<typeof createSessionSchema>;
export type UpdateRoundResponse = z.infer<typeof updateRoundResponseSchema>;

export const users = {
  id: "",
  username: "",
  password: "",
};

export type InsertUser = { username: string; password: string };
export type User = { id: string; username: string; password: string };
