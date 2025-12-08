import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Home, 
  Plus, 
  ChevronLeft,
  Shuffle,
  History,
  Download,
  Zap,
  Trophy,
  Target,
  Sparkles
} from "lucide-react";
import { GameCard } from "@/components/GameCard";
import { GameArena } from "@/components/GameArena";
import { GameStepIndicator } from "@/components/GameStepIndicator";
import { ResponseForm } from "@/components/ResponseForm";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { SessionHistory, SessionStats } from "@/components/SessionHistory";
import type { GameSession, GameRound } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

type ViewMode = "game" | "history";

export default function Game() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("game");
  const [selectedHistoryRound, setSelectedHistoryRound] = useState<GameRound | null>(null);
  const [activeTableCards, setActiveTableCards] = useState<string[]>([]);

  const { data: session, isLoading, error } = useQuery<GameSession>({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId,
  });

  const drawCardsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/sessions/${sessionId}/rounds`);
      return await response.json() as GameRound;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId] });
      setActiveTableCards([]);
    },
  });

  const updateRoundMutation = useMutation({
    mutationFn: async ({ roundId, step, response }: { 
      roundId: string; 
      step: string; 
      response: Record<string, string> 
    }) => {
      const res = await apiRequest("PATCH", `/api/sessions/${sessionId}/rounds/${roundId}`, {
        step,
        response,
      });
      return await res.json() as GameRound;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId] });
    },
  });

  const activeRound = session?.rounds?.find(r => r.currentStep !== "complete");
  const lastRound = session?.rounds?.[session.rounds.length - 1];
  const currentRound = activeRound || (lastRound?.currentStep === "complete" && !selectedHistoryRound ? lastRound : undefined);
  const hasActiveRound = !!activeRound;
  const showingCompletedRound = !activeRound && lastRound?.currentStep === "complete" && !selectedHistoryRound;

  const handleStartNewRound = () => {
    drawCardsMutation.mutate();
    setViewMode("game");
    setSelectedHistoryRound(null);
  };

  const handleSubmitResponse = (values: Record<string, string>) => {
    if (!currentRound) return;

    const stepOrder = ["cards", "diagnosis", "decision", "execution", "storytelling", "complete"];
    const currentIndex = stepOrder.indexOf(currentRound.currentStep);
    const nextStep = stepOrder[currentIndex + 1] || currentRound.currentStep;

    updateRoundMutation.mutate({
      roundId: currentRound.id,
      step: nextStep,
      response: values,
    });
  };

  const handleProceedFromArena = (tableCards: string[], responses: Record<string, string>) => {
    if (!currentRound) return;
    setActiveTableCards(tableCards);
    updateRoundMutation.mutate({
      roundId: currentRound.id,
      step: "complete",
      response: responses,
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Shuffle className="h-8 w-8 text-primary" />
          </motion.div>
          <p className="text-muted-foreground">Carregando sessão...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-md w-full border-border/50 bg-card/80">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="font-display text-xl font-semibold mb-2">Sessão não encontrada</h2>
              <p className="text-muted-foreground mb-6">
                A sessão de jogo solicitada não existe ou foi removida.
              </p>
              <Button onClick={() => setLocation("/")} className="btn-game-primary" data-testid="button-go-home">
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const completedRoundsCount = session.rounds.filter(r => r.currentStep === "complete").length;
  const totalScore = session.rounds.reduce((sum, r) => sum + (r.score?.total || 0), 0);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="shrink-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setLocation("/")}
              data-testid="button-home"
            >
              <Home className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display font-semibold text-lg">Executive Stories</h1>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground">
                  {session.mode === "solo" ? "Solo" : "Grupo"}
                </span>
                <span className="text-border">|</span>
                <span className="text-muted-foreground">
                  {completedRoundsCount} rodadas
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalScore > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 mr-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-mono-game text-sm font-semibold text-primary">{totalScore}</span>
              </div>
            )}
            
            <Button
              variant={viewMode === "game" ? "default" : "ghost"}
              size="sm"
              onClick={() => { setViewMode("game"); setSelectedHistoryRound(null); }}
              data-testid="button-view-game"
            >
              <Shuffle className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Jogo</span>
            </Button>
            <Button
              variant={viewMode === "history" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("history")}
              data-testid="button-view-history"
            >
              <History className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Histórico</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              data-testid="button-export-session"
            >
              <a href={`/api/sessions/${sessionId}/export`} download>
                <Download className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {viewMode === "history" ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto p-6"
            >
              <div className="max-w-4xl mx-auto space-y-6">
                <SessionStats session={session} />
                <SessionHistory 
                  session={session} 
                  onSelectRound={(round) => {
                    setSelectedHistoryRound(round);
                    setViewMode("game");
                  }}
                />
              </div>
            </motion.div>
          ) : selectedHistoryRound ? (
            <motion.div
              key="history-round"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto p-6"
            >
              <div className="max-w-4xl mx-auto">
                <HistoryRoundView 
                  round={selectedHistoryRound} 
                  onBack={() => setSelectedHistoryRound(null)}
                />
              </div>
            </motion.div>
          ) : showingCompletedRound && lastRound ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-y-auto p-6"
            >
              <div className="max-w-4xl mx-auto">
                <CompletedRoundView 
                  round={lastRound} 
                  onNewRound={handleStartNewRound}
                  isStarting={drawCardsMutation.isPending}
                />
              </div>
            </motion.div>
          ) : !hasActiveRound ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex items-center justify-center"
            >
              <EmptyState onStartRound={handleStartNewRound} isLoading={drawCardsMutation.isPending} />
            </motion.div>
          ) : currentRound ? (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {currentRound.currentStep === "cards" ? (
                <GameArena
                  cards={currentRound.cards}
                  currentStep={currentRound.currentStep}
                  onProceedToResponse={handleProceedFromArena}
                  roundNumber={currentRound.roundNumber}
                  isSubmitting={updateRoundMutation.isPending}
                />
              ) : (
                <ActiveRoundView
                  round={currentRound}
                  tableCards={activeTableCards}
                  onSubmit={handleSubmitResponse}
                  isSubmitting={updateRoundMutation.isPending}
                />
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}

interface EmptyStateProps {
  onStartRound: () => void;
  isLoading: boolean;
}

function EmptyState({ onStartRound, isLoading }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="mb-8"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
          <div className="relative p-6 rounded-full bg-primary/10 border border-primary/20">
            <Shuffle className="h-16 w-16 text-primary" />
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="font-display text-3xl font-semibold mb-3">Pronto para jogar?</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Sorteie 6 cartas para iniciar uma nova rodada de treinamento executivo.
        </p>
        <Button 
          size="lg" 
          className="btn-game-primary text-primary-foreground font-semibold px-8"
          onClick={onStartRound}
          disabled={isLoading}
          data-testid="button-draw-cards"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <motion.div 
                className="h-5 w-5 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Sorteando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Sortear Cartas
            </span>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

interface CompletedRoundViewProps {
  round: GameRound;
  onNewRound: () => void;
  isStarting: boolean;
}

function CompletedRoundView({ round, onNewRound, isStarting }: CompletedRoundViewProps) {
  const cards = round.cards;
  const cardArray = [
    { key: "context", card: cards.context },
    { key: "strategy", card: cards.strategy },
    { key: "finance", card: cards.finance },
    { key: "project", card: cards.project },
    { key: "governance", card: cards.governance },
    { key: "storytelling", card: cards.storytelling },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="font-display text-2xl font-semibold">Rodada {round.roundNumber} Completa</h2>
          </div>
          <p className="text-sm text-muted-foreground ml-13">
            {round.completedAt
              ? new Date(round.completedAt).toLocaleString("pt-BR", { 
                  dateStyle: "short", 
                  timeStyle: "short" 
                })
              : "Rodada finalizada"}
          </p>
        </div>
        <Button 
          onClick={onNewRound}
          disabled={isStarting}
          className="btn-game-primary text-primary-foreground"
          data-testid="button-draw-cards"
        >
          {isStarting ? (
            <span className="flex items-center gap-2">
              <motion.div 
                className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Sorteando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Rodada
            </span>
          )}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Cartas Sorteadas</h3>
          <div className="grid gap-3">
            {cardArray.map(({ key, card }, index) => (
              <GameCard key={key} card={card} isCompact index={index} />
            ))}
          </div>
        </div>
        <div>
          {round.score && <ScoreDisplay score={round.score} />}
        </div>
      </div>
    </div>
  );
}

interface ActiveRoundViewProps {
  round: GameRound;
  tableCards: string[];
  onSubmit: (values: Record<string, string>) => void;
  isSubmitting: boolean;
}

function ActiveRoundView({ round, tableCards, onSubmit, isSubmitting }: ActiveRoundViewProps) {
  const cards = round.cards;
  const cardArray = [
    { key: "context", card: cards.context, label: "Contexto" },
    { key: "strategy", card: cards.strategy, label: "Estratégia" },
    { key: "finance", card: cards.finance, label: "Finanças" },
    { key: "project", card: cards.project, label: "Projetos" },
    { key: "governance", card: cards.governance, label: "Governança" },
    { key: "storytelling", card: cards.storytelling, label: "Storytelling" },
  ];

  const focusedCards = tableCards.length > 0 
    ? cardArray.filter(c => tableCards.includes(c.key))
    : cardArray;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-2xl font-semibold mb-1">Rodada {round.roundNumber}</h2>
            <p className="text-sm text-muted-foreground">
              Aja como executivo responsável por resolver essa situação.
            </p>
          </div>
          <GameStepIndicator currentStep={round.currentStep} />
        </div>

        {round.currentStep === "complete" ? (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Cartas desta Rodada</h3>
              <div className="grid gap-3">
                {cardArray.map(({ key, card }, index) => (
                  <GameCard key={key} card={card} isCompact index={index} />
                ))}
              </div>
            </div>
            <div>
              {round.score && <ScoreDisplay score={round.score} />}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {tableCards.length > 0 ? "Cartas em Foco" : "Todas as Cartas"}
              </h3>
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-3 pr-4">
                  {focusedCards.map(({ key, card }, index) => (
                    <GameCard key={key} card={card} isCompact index={index} />
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="lg:col-span-3">
              <ResponseForm
                step={round.currentStep}
                cards={cards}
                initialValues={getInitialValues(round)}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface HistoryRoundViewProps {
  round: GameRound;
  onBack: () => void;
}

function HistoryRoundView({ round, onBack }: HistoryRoundViewProps) {
  const cards = round.cards;
  const cardArray = [
    { key: "context", card: cards.context },
    { key: "strategy", card: cards.strategy },
    { key: "finance", card: cards.finance },
    { key: "project", card: cards.project },
    { key: "governance", card: cards.governance },
    { key: "storytelling", card: cards.storytelling },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back-history">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-display text-xl font-semibold">Rodada {round.roundNumber}</h2>
          <p className="text-sm text-muted-foreground">
            {round.completedAt
              ? new Date(round.completedAt).toLocaleString("pt-BR", { 
                  dateStyle: "short", 
                  timeStyle: "short" 
                })
              : "Histórico da rodada"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Cartas Sorteadas</h3>
          <div className="grid gap-3">
            {cardArray.map(({ key, card }, index) => (
              <GameCard key={key} card={card} isCompact index={index} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {round.score && <ScoreDisplay score={round.score} />}

          {round.response.diagnosis && (
            <Card className="border-border/50 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg">Diagnóstico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {round.response.diagnosis.contextDescription && (
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1 text-xs uppercase tracking-wider">Contexto e Problema</h4>
                    <p className="whitespace-pre-wrap">{round.response.diagnosis.contextDescription}</p>
                  </div>
                )}
                {round.response.diagnosis.mainRisks && (
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1 text-xs uppercase tracking-wider">Principais Riscos</h4>
                    <p className="whitespace-pre-wrap">{round.response.diagnosis.mainRisks}</p>
                  </div>
                )}
                {round.response.diagnosis.opportunities && (
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1 text-xs uppercase tracking-wider">Oportunidades</h4>
                    <p className="whitespace-pre-wrap">{round.response.diagnosis.opportunities}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {round.response.decision && (
            <Card className="border-border/50 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg">Decisões</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {round.response.decision.strategicDecisions && (
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1 text-xs uppercase tracking-wider">Decisões Estratégicas</h4>
                    <p className="whitespace-pre-wrap">{round.response.decision.strategicDecisions}</p>
                  </div>
                )}
                {round.response.decision.financialIndicators && (
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1 text-xs uppercase tracking-wider">Indicadores Financeiros</h4>
                    <p className="whitespace-pre-wrap">{round.response.decision.financialIndicators}</p>
                  </div>
                )}
                {round.response.decision.scenarios && (
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1 text-xs uppercase tracking-wider">Cenários</h4>
                    <p className="whitespace-pre-wrap">{round.response.decision.scenarios}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {round.response.execution && (
            <Card className="border-border/50 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg">Plano de Execução</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {round.response.execution.initiatives && (
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1 text-xs uppercase tracking-wider">Iniciativas</h4>
                    <p className="whitespace-pre-wrap">{round.response.execution.initiatives}</p>
                  </div>
                )}
                {round.response.execution.riskMitigation && (
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1 text-xs uppercase tracking-wider">Mitigação de Riscos</h4>
                    <p className="whitespace-pre-wrap">{round.response.execution.riskMitigation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {round.response.storytelling && (
            <Card className="border-border/50 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg">Storytelling</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="whitespace-pre-wrap">{round.response.storytelling.presentation}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function getInitialValues(round: GameRound): Record<string, string> {
  switch (round.currentStep) {
    case "diagnosis":
      return {
        contextDescription: round.response.diagnosis?.contextDescription || "",
        mainRisks: round.response.diagnosis?.mainRisks || "",
        opportunities: round.response.diagnosis?.opportunities || "",
      };
    case "decision":
      return {
        strategicDecisions: round.response.decision?.strategicDecisions || "",
        financialIndicators: round.response.decision?.financialIndicators || "",
        scenarios: round.response.decision?.scenarios || "",
      };
    case "execution":
      return {
        initiatives: round.response.execution?.initiatives || "",
        riskMitigation: round.response.execution?.riskMitigation || "",
      };
    case "storytelling":
      return {
        presentation: round.response.storytelling?.presentation || "",
      };
    default:
      return {};
  }
}
