import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  Plus, 
  ArrowRight,
  ChevronLeft,
  Shuffle,
  History,
  BarChart3
} from "lucide-react";
import { GameCard } from "@/components/GameCard";
import { GameStepIndicator } from "@/components/GameStepIndicator";
import { ResponseForm } from "@/components/ResponseForm";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { SessionHistory, SessionStats } from "@/components/SessionHistory";
import type { GameSession, GameRound, DrawnCards } from "@shared/schema";

type ViewMode = "game" | "history";

export default function Game() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("game");
  const [selectedHistoryRound, setSelectedHistoryRound] = useState<GameRound | null>(null);

  const { data: session, isLoading, error } = useQuery<GameSession>({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId,
  });

  const drawCardsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/sessions/${sessionId}/rounds`);
      return response as GameRound;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId] });
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
      return res as GameRound;
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

  const handleContinueFromCards = () => {
    if (!currentRound) return;
    updateRoundMutation.mutate({
      roundId: currentRound.id,
      step: "diagnosis",
      response: {},
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Sessão não encontrada</h2>
            <p className="text-muted-foreground mb-4">
              A sessão de jogo solicitada não existe ou foi removida.
            </p>
            <Button onClick={() => setLocation("/")} data-testid="button-go-home">
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedRoundsCount = session.rounds.filter(r => r.currentStep === "complete").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
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
              <h1 className="font-semibold">Executive Stories</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {session.mode === "solo" ? "Solo" : "Grupo"}
                </Badge>
                <span>{completedRoundsCount} rodadas completadas</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "game" ? "default" : "outline"}
              size="sm"
              onClick={() => { setViewMode("game"); setSelectedHistoryRound(null); }}
              data-testid="button-view-game"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Jogo
            </Button>
            <Button
              variant={viewMode === "history" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("history")}
              data-testid="button-view-history"
            >
              <History className="h-4 w-4 mr-2" />
              Histórico
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {viewMode === "history" ? (
          <div className="space-y-6">
            <SessionStats session={session} />
            <SessionHistory 
              session={session} 
              onSelectRound={(round) => {
                setSelectedHistoryRound(round);
                setViewMode("game");
              }}
            />
          </div>
        ) : selectedHistoryRound ? (
          <HistoryRoundView 
            round={selectedHistoryRound} 
            onBack={() => setSelectedHistoryRound(null)}
          />
        ) : showingCompletedRound && lastRound ? (
          <CompletedRoundView 
            round={lastRound} 
            onNewRound={handleStartNewRound}
            isStarting={drawCardsMutation.isPending}
          />
        ) : !hasActiveRound ? (
          <EmptyState onStartRound={handleStartNewRound} isLoading={drawCardsMutation.isPending} />
        ) : currentRound ? (
          <ActiveRoundView
            round={currentRound}
            onSubmit={handleSubmitResponse}
            onContinue={handleContinueFromCards}
            isSubmitting={updateRoundMutation.isPending}
          />
        ) : null}
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
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-primary/10 mb-6">
        <Shuffle className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">Pronto para começar?</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Clique no botão abaixo para sortear suas cartas e iniciar uma nova rodada de treinamento executivo.
      </p>
      <Button 
        size="lg" 
        onClick={onStartRound}
        disabled={isLoading}
        data-testid="button-new-round"
      >
        {isLoading ? (
          "Sorteando..."
        ) : (
          <>
            <Plus className="h-5 w-5 mr-2" />
            Nova Rodada
          </>
        )}
      </Button>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">Rodada {round.roundNumber} - Completa</h2>
          <p className="text-sm text-muted-foreground">
            {round.completedAt
              ? `Completada em ${new Date(round.completedAt).toLocaleString("pt-BR")}`
              : "Rodada finalizada"}
          </p>
        </div>
        <Button 
          onClick={onNewRound}
          disabled={isStarting}
          data-testid="button-new-round-after-complete"
        >
          {isStarting ? (
            "Sorteando..."
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Nova Rodada
            </>
          )}
        </Button>
      </div>

      <Separator />

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-semibold">Cartas Sorteadas</h3>
          <div className="grid gap-3">
            {cardArray.map(({ key, card }) => (
              <GameCard key={key} card={card} isCompact />
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
  onSubmit: (values: Record<string, string>) => void;
  onContinue: () => void;
  isSubmitting: boolean;
}

function ActiveRoundView({ round, onSubmit, onContinue, isSubmitting }: ActiveRoundViewProps) {
  const cards = round.cards;
  const cardArray = [
    { key: "context", card: cards.context, label: "Contexto" },
    { key: "strategy", card: cards.strategy, label: "Estratégia" },
    { key: "finance", card: cards.finance, label: "Finanças" },
    { key: "project", card: cards.project, label: "Projetos" },
    { key: "governance", card: cards.governance, label: "Governança" },
    { key: "storytelling", card: cards.storytelling, label: "Storytelling" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">Rodada {round.roundNumber}</h2>
          <p className="text-sm text-muted-foreground">
            Seu desafio é agir como executivo responsável por essa situação.
          </p>
        </div>
        <div className="overflow-x-auto">
          <GameStepIndicator currentStep={round.currentStep} />
        </div>
      </div>

      <Separator />

      {round.currentStep === "cards" ? (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cardArray.map(({ key, card }) => (
              <GameCard key={key} card={card} />
            ))}
          </div>
          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={onContinue}
              disabled={isSubmitting}
              data-testid="button-start-diagnosis"
            >
              Iniciar Diagnóstico
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      ) : round.currentStep === "complete" ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Cartas desta Rodada</h3>
            <div className="grid gap-3">
              {cardArray.map(({ key, card }) => (
                <GameCard key={key} card={card} isCompact />
              ))}
            </div>
          </div>
          <div>
            {round.score && <ScoreDisplay score={round.score} />}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">Cartas Sorteadas</h3>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-3 pr-4">
                {cardArray.map(({ key, card }) => (
                  <GameCard key={key} card={card} isCompact />
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
          <h2 className="text-xl font-semibold">Rodada {round.roundNumber}</h2>
          <p className="text-sm text-muted-foreground">
            {round.completedAt
              ? `Completada em ${new Date(round.completedAt).toLocaleString("pt-BR")}`
              : "Histórico da rodada"}
          </p>
        </div>
      </div>

      <Separator />

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-semibold">Cartas Sorteadas</h3>
          <div className="grid gap-3">
            {cardArray.map(({ key, card }) => (
              <GameCard key={key} card={card} isCompact />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {round.score && <ScoreDisplay score={round.score} />}

          {round.response.diagnosis && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Diagnóstico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {round.response.diagnosis.contextDescription && (
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">Contexto e Problema</h4>
                    <p className="whitespace-pre-wrap">{round.response.diagnosis.contextDescription}</p>
                  </div>
                )}
                {round.response.diagnosis.mainRisks && (
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">Principais Riscos</h4>
                    <p className="whitespace-pre-wrap">{round.response.diagnosis.mainRisks}</p>
                  </div>
                )}
                {round.response.diagnosis.opportunities && (
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">Oportunidades</h4>
                    <p className="whitespace-pre-wrap">{round.response.diagnosis.opportunities}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {round.response.decision && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Decisões</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {round.response.decision.strategicDecisions && (
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">Decisões Estratégicas</h4>
                    <p className="whitespace-pre-wrap">{round.response.decision.strategicDecisions}</p>
                  </div>
                )}
                {round.response.decision.financialIndicators && (
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">Indicadores Financeiros</h4>
                    <p className="whitespace-pre-wrap">{round.response.decision.financialIndicators}</p>
                  </div>
                )}
                {round.response.decision.scenarios && (
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">Cenários</h4>
                    <p className="whitespace-pre-wrap">{round.response.decision.scenarios}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {round.response.execution && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Plano de Execução</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {round.response.execution.initiatives && (
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">Iniciativas</h4>
                    <p className="whitespace-pre-wrap">{round.response.execution.initiatives}</p>
                  </div>
                )}
                {round.response.execution.riskMitigation && (
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">Mitigação de Riscos</h4>
                    <p className="whitespace-pre-wrap">{round.response.execution.riskMitigation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {round.response.storytelling && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Storytelling</CardTitle>
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
