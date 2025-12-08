import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, TrendingUp, MessageSquare, BarChart3 } from "lucide-react";
import type { RoundScore } from "@shared/schema";

interface ScoreDisplayProps {
  score: RoundScore;
}

const CRITERIA = [
  { key: "diagnosisClarity", label: "Clareza de Diagnóstico", icon: Target },
  { key: "financialCoherence", label: "Coerência Financeira", icon: BarChart3 },
  { key: "executionRobustness", label: "Robustez do Plano de Execução", icon: TrendingUp },
  { key: "storytellingQuality", label: "Qualidade do Storytelling", icon: MessageSquare },
] as const;

function getScoreLevel(total: number): { label: string; color: string; description: string } {
  if (total <= 4) {
    return {
      label: "Iniciante",
      color: "bg-chart-3/10 text-chart-3 border-chart-3/20",
      description: "Iniciante no cenário - continue praticando para desenvolver suas habilidades executivas.",
    };
  } else if (total <= 8) {
    return {
      label: "Intermediário",
      color: "bg-chart-2/10 text-chart-2 border-chart-2/20",
      description: "Boa estrutura, precisa refinar decisões - você está no caminho certo.",
    };
  } else {
    return {
      label: "Executivo",
      color: "bg-chart-5/10 text-chart-5 border-chart-5/20",
      description: "Nível executivo / consultor bem estruturado - excelente performance!",
    };
  }
}

function getScoreColor(value: number): string {
  if (value === 0) return "bg-destructive";
  if (value === 1) return "bg-chart-3";
  if (value === 2) return "bg-chart-2";
  return "bg-chart-5";
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  const level = getScoreLevel(score.total);

  return (
    <div className="space-y-6" data-testid="score-display">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-5/10">
                <Trophy className="h-6 w-6 text-chart-5" />
              </div>
              Avaliação da Rodada
            </CardTitle>
            <Badge className={`text-base px-4 py-1.5 ${level.color}`}>
              {score.total}/12 pontos
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div className="text-4xl font-bold">{score.total}</div>
            <div className="flex-1">
              <Badge className={level.color}>{level.label}</Badge>
              <p className="text-sm text-muted-foreground mt-1">{level.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Critérios de Avaliação</h4>
            <div className="grid gap-3">
              {CRITERIA.map(({ key, label, icon: Icon }) => {
                const value = score[key as keyof typeof score] as number;
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <span className="text-sm font-semibold">{value}/3</span>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map(i => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-sm ${
                            i < value ? getScoreColor(value) : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {score.feedback && (
            <div className="border-t pt-4 space-y-2">
              <h4 className="font-medium">Feedback</h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {score.feedback}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
