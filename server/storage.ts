import { randomUUID } from "crypto";
import type { 
  GameSession, 
  GameRound, 
  DrawnCards,
  RoundResponse,
  RoundScore,
  CreateSession
} from "@shared/schema";
import { drawRandomCards } from "@shared/cardData";

export interface IStorage {
  createSession(data: CreateSession): Promise<GameSession>;
  getSession(id: string): Promise<GameSession | undefined>;
  getAllSessions(): Promise<GameSession[]>;
  createRound(sessionId: string): Promise<GameRound | undefined>;
  updateRound(sessionId: string, roundId: string, step: string, response: Record<string, string>): Promise<GameRound | undefined>;
}

function calculateScore(response: RoundResponse): RoundScore {
  let diagnosisClarity = 0;
  let financialCoherence = 0;
  let executionRobustness = 0;
  let storytellingQuality = 0;

  if (response.diagnosis) {
    const d = response.diagnosis;
    if (d.contextDescription && d.contextDescription.length > 50) diagnosisClarity++;
    if (d.contextDescription && d.contextDescription.length > 150) diagnosisClarity++;
    if (d.mainRisks && d.mainRisks.length > 50) diagnosisClarity++;
    diagnosisClarity = Math.min(diagnosisClarity, 3);
  }

  if (response.decision) {
    const d = response.decision;
    if (d.strategicDecisions && d.strategicDecisions.length > 50) financialCoherence++;
    if (d.financialIndicators && d.financialIndicators.length > 50) financialCoherence++;
    if (d.scenarios && d.scenarios.length > 100) financialCoherence++;
    financialCoherence = Math.min(financialCoherence, 3);
  }

  if (response.execution) {
    const e = response.execution;
    if (e.initiatives && e.initiatives.length > 100) executionRobustness++;
    if (e.initiatives && e.initiatives.length > 200) executionRobustness++;
    if (e.riskMitigation && e.riskMitigation.length > 100) executionRobustness++;
    executionRobustness = Math.min(executionRobustness, 3);
  }

  if (response.storytelling) {
    const s = response.storytelling;
    if (s.presentation && s.presentation.length > 100) storytellingQuality++;
    if (s.presentation && s.presentation.length > 300) storytellingQuality++;
    if (s.presentation && s.presentation.length > 500) storytellingQuality++;
    storytellingQuality = Math.min(storytellingQuality, 3);
  }

  const total = diagnosisClarity + financialCoherence + executionRobustness + storytellingQuality;

  let feedback = "";
  if (total <= 4) {
    feedback = "Iniciante no cenário. Suas respostas estão no caminho certo, mas podem ser mais detalhadas e estruturadas. Tente ser mais específico em cada etapa e considere como os diferentes elementos do cenário se conectam.";
  } else if (total <= 8) {
    feedback = "Boa estrutura, precisa refinar decisões. Você demonstra compreensão do cenário e apresenta análises relevantes. Para avançar, aprofunde a conexão entre diagnóstico, decisões e plano de execução. Seu storytelling pode ser mais impactante.";
  } else {
    feedback = "Nível executivo / consultor bem estruturado. Excelente análise! Você demonstra visão estratégica, coerência financeira e capacidade de comunicar decisões de forma clara e persuasiva. Continue praticando para manter a excelência.";
  }

  return {
    diagnosisClarity,
    financialCoherence,
    executionRobustness,
    storytellingQuality,
    total,
    feedback,
  };
}

export class MemStorage implements IStorage {
  private sessions: Map<string, GameSession>;

  constructor() {
    this.sessions = new Map();
  }

  async createSession(data: CreateSession): Promise<GameSession> {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const session: GameSession = {
      id,
      mode: data.mode,
      playerCount: data.playerCount || 1,
      rounds: [],
      createdAt: now,
      updatedAt: now,
    };

    this.sessions.set(id, session);
    return session;
  }

  async getSession(id: string): Promise<GameSession | undefined> {
    return this.sessions.get(id);
  }

  async getAllSessions(): Promise<GameSession[]> {
    return Array.from(this.sessions.values());
  }

  async createRound(sessionId: string): Promise<GameRound | undefined> {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const roundNumber = session.rounds.length + 1;
    const cards = drawRandomCards();

    const round: GameRound = {
      id: randomUUID(),
      roundNumber,
      cards,
      response: {},
      currentStep: "cards",
    };

    session.rounds.push(round);
    session.updatedAt = new Date().toISOString();
    this.sessions.set(sessionId, session);

    return round;
  }

  async updateRound(
    sessionId: string, 
    roundId: string, 
    step: string, 
    response: Record<string, string>
  ): Promise<GameRound | undefined> {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const roundIndex = session.rounds.findIndex(r => r.id === roundId);
    if (roundIndex === -1) return undefined;

    const round = session.rounds[roundIndex];
    
    const stepOrder = ["cards", "diagnosis", "decision", "execution", "storytelling", "complete"];
    const currentIndex = stepOrder.indexOf(round.currentStep);
    const nextIndex = stepOrder.indexOf(step);

    if (nextIndex < 0 || nextIndex > currentIndex + 1) {
      return round;
    }

    const sanitize = (value: unknown): string => {
      if (typeof value === 'string') return value.trim();
      return '';
    };

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

    round.currentStep = step as GameRound["currentStep"];

    if (step === "complete") {
      round.completedAt = new Date().toISOString();
      round.score = calculateScore(round.response);
    }

    session.rounds[roundIndex] = round;
    session.updatedAt = new Date().toISOString();
    this.sessions.set(sessionId, session);

    return round;
  }
}

export const storage = new MemStorage();
