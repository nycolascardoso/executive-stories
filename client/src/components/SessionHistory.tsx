import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Trophy, ChevronRight, FileText, Target, TrendingUp } from "lucide-react";
import { DECK_INFO } from "@shared/cardData";
import type { GameRound, GameSession } from "@shared/schema";
import { motion } from "framer-motion";

interface SessionHistoryProps {
  session: GameSession;
  onSelectRound?: (round: GameRound) => void;
}

export function SessionHistory({ session, onSelectRound }: SessionHistoryProps) {
  const completedRounds = session.rounds.filter(r => r.currentStep === "complete");

  if (completedRounds.length === 0) {
    return (
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-display font-medium text-lg mb-2">Nenhuma rodada completada</h3>
          <p className="text-sm text-muted-foreground">
            Complete rodadas para ver o histórico aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/80" data-testid="session-history">
      <CardHeader className="pb-4 border-b border-border/30">
        <CardTitle className="flex items-center gap-2 font-display">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Histórico da Sessão
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="max-h-[500px]">
          <Accordion type="single" collapsible className="space-y-2">
            {completedRounds.map((round, index) => (
              <motion.div
                key={round.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
              >
                <AccordionItem
                  value={round.id}
                  className="border border-border/30 rounded-xl px-4 bg-card/50"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center justify-between gap-4 w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-mono-game text-sm font-semibold text-primary">
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
                        <Badge className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20">
                          <Trophy className="h-3 w-3" />
                          <span className="font-mono-game">{round.score.total}</span>
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(round.cards).map(([key, card]) => {
                          return (
                            <div
                              key={key}
                              className="p-2 rounded-lg bg-muted/30 border border-border/20 text-xs"
                            >
                              <div className="font-mono-game text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">
                                {card.id}
                              </div>
                              <div className="font-medium truncate">{card.name}</div>
                            </div>
                          );
                        })}
                      </div>

                      {round.score?.feedback && (
                        <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                          <div className="text-xs font-medium mb-1 text-muted-foreground uppercase tracking-wider">Feedback:</div>
                          <p className="text-xs text-foreground/80 line-clamp-3">
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
              </motion.div>
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
  const bestScore = Math.max(...completedRounds.map(r => r.score?.total || 0), 0);

  return (
    <motion.div 
      className="grid grid-cols-3 gap-4" 
      data-testid="session-stats"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-4 text-center">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div className="font-mono-game text-2xl font-bold">{completedRounds.length}</div>
          <div className="text-xs text-muted-foreground">Rodadas</div>
        </CardContent>
      </Card>
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-4 text-center">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="font-mono-game text-2xl font-bold">{avgScore.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">Média</div>
        </CardContent>
      </Card>
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-4 text-center">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
            <Trophy className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="font-mono-game text-2xl font-bold text-emerald-400">{bestScore}</div>
          <div className="text-xs text-muted-foreground">Melhor</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
