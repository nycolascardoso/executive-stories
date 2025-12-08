import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, TrendingUp, MessageSquare, BarChart3, Sparkles } from "lucide-react";
import type { RoundScore } from "@shared/schema";
import { motion } from "framer-motion";

interface ScoreDisplayProps {
  score: RoundScore;
}

const CRITERIA = [
  { key: "diagnosisClarity", label: "Diagnóstico", icon: Target, color: "text-amber-400" },
  { key: "financialCoherence", label: "Finanças", icon: BarChart3, color: "text-cyan-400" },
  { key: "executionRobustness", label: "Execução", icon: TrendingUp, color: "text-blue-400" },
  { key: "storytellingQuality", label: "Storytelling", icon: MessageSquare, color: "text-pink-400" },
] as const;

function getScoreLevel(total: number): { label: string; color: string; bgColor: string; description: string } {
  if (total <= 4) {
    return {
      label: "Iniciante",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10 border-orange-500/20",
      description: "Continue praticando para desenvolver suas habilidades executivas.",
    };
  } else if (total <= 8) {
    return {
      label: "Intermediário",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10 border-cyan-500/20",
      description: "Boa estrutura, precisa refinar algumas decisões.",
    };
  } else {
    return {
      label: "Executivo",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
      description: "Excelente performance! Nível executivo bem estruturado.",
    };
  }
}

function getScoreBarColor(value: number): string {
  if (value === 0) return "bg-red-500";
  if (value === 1) return "bg-orange-500";
  if (value === 2) return "bg-cyan-500";
  return "bg-emerald-500";
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  const level = getScoreLevel(score.total);

  return (
    <motion.div 
      className="space-y-6" 
      data-testid="score-display"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-border/50 bg-card/80 overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/30">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="flex items-center gap-3 font-display">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              Avaliação
            </CardTitle>
            <Badge className={`font-mono-game text-sm px-3 py-1 border ${level.bgColor} ${level.color}`}>
              {score.total}/12
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <motion.div 
            className={`flex items-center gap-4 p-4 rounded-xl border ${level.bgColor}`}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className={`font-mono-game text-4xl font-bold ${level.color}`}>
              {score.total}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className={`h-4 w-4 ${level.color}`} />
                <span className={`font-semibold ${level.color}`}>{level.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{level.description}</p>
            </div>
          </motion.div>

          <div className="space-y-4">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Critérios</h4>
            <div className="grid gap-4">
              {CRITERIA.map(({ key, label, icon: Icon, color }, index) => {
                const value = score[key as keyof typeof score] as number;
                return (
                  <motion.div 
                    key={key} 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${color}`} />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <span className="font-mono-game text-sm font-semibold">{value}/3</span>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${
                            i < value ? getScoreBarColor(value) : "bg-muted"
                          }`}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 + 0.1 * index + 0.05 * i }}
                          style={{ transformOrigin: "left" }}
                        />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {score.feedback && (
            <motion.div 
              className="border-t border-border/30 pt-4 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Feedback da IA</h4>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {score.feedback}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
