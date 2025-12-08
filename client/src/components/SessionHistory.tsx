import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Trophy, ChevronRight, FileText } from "lucide-react";
import { DECK_INFO } from "@shared/cardData";
import type { GameRound, GameSession } from "@shared/schema";

interface SessionHistoryProps {
  session: GameSession;
  onSelectRound?: (round: GameRound) => void;
}

export function SessionHistory({ session, onSelectRound }: SessionHistoryProps) {
  const completedRounds = session.rounds.filter(r => r.currentStep === "complete");

  if (completedRounds.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-lg mb-2">Nenhuma rodada completada</h3>
          <p className="text-sm text-muted-foreground">
            Complete rodadas para ver o histórico aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="session-history">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Histórico da Sessão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[500px]">
          <Accordion type="single" collapsible className="space-y-2">
            {completedRounds.map((round, index) => (
              <AccordionItem
                key={round.id}
                value={round.id}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center justify-between gap-4 w-full pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                        {round.roundNumber}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Rodada {round.roundNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {round.completedAt
                            ? new Date(round.completedAt).toLocaleString("pt-BR", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "Em andamento"}
                        </div>
                      </div>
                    </div>
                    {round.score && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        {round.score.total}/12
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(round.cards).map(([key, card]) => {
                        const deckInfo = DECK_INFO[card.deckType];
                        return (
                          <div
                            key={key}
                            className="p-2 rounded-md bg-muted/50 text-xs"
                          >
                            <div className="font-mono text-muted-foreground mb-0.5">
                              {card.id}
                            </div>
                            <div className="font-medium truncate">{card.name}</div>
                          </div>
                        );
                      })}
                    </div>

                    {round.score?.feedback && (
                      <div className="p-3 rounded-md bg-muted/50">
                        <div className="text-xs font-medium mb-1">Feedback:</div>
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {round.score.feedback}
                        </p>
                      </div>
                    )}

                    {onSelectRound && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectRound(round)}
                        className="w-full"
                        data-testid={`button-view-round-${round.roundNumber}`}
                      >
                        Ver Detalhes
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface SessionStatsProps {
  session: GameSession;
}

export function SessionStats({ session }: SessionStatsProps) {
  const completedRounds = session.rounds.filter(r => r.currentStep === "complete");
  const totalScore = completedRounds.reduce((sum, r) => sum + (r.score?.total || 0), 0);
  const avgScore = completedRounds.length > 0 ? totalScore / completedRounds.length : 0;

  const decksUsed = new Set<string>();
  completedRounds.forEach(round => {
    Object.values(round.cards).forEach(card => {
      decksUsed.add(card.deckType);
    });
  });

  return (
    <div className="grid grid-cols-3 gap-4" data-testid="session-stats">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold">{completedRounds.length}</div>
          <div className="text-sm text-muted-foreground">Rodadas</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold">{avgScore.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">Média</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold">{decksUsed.size}</div>
          <div className="text-sm text-muted-foreground">Categorias</div>
        </CardContent>
      </Card>
    </div>
  );
}
