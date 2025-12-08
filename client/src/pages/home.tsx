import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  PlayCircle, 
  Users, 
  Briefcase, 
  Lightbulb, 
  BarChart3, 
  ClipboardList, 
  ShieldCheck, 
  MessageSquare,
  Target,
  Trophy,
  Clock,
  LogIn,
  LogOut,
  User,
  TrendingUp
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { GameSession } from "@shared/schema";

const DECK_FEATURES = [
  { icon: Briefcase, label: "Contexto & Empresa", description: "10 cenários de diferentes tipos de negócio" },
  { icon: Lightbulb, label: "Estratégia", description: "10 desafios estratégicos clássicos" },
  { icon: BarChart3, label: "Finanças & Métricas", description: "10 tensões financeiras para resolver" },
  { icon: ClipboardList, label: "Projetos & Execução", description: "10 problemas de execução" },
  { icon: ShieldCheck, label: "Governança & Risco", description: "10 riscos de governança" },
  { icon: MessageSquare, label: "Storytelling", description: "10 palcos de comunicação executiva" },
];

const GAME_STEPS = [
  { icon: Target, label: "Diagnóstico", description: "Analise o contexto, riscos e oportunidades" },
  { icon: BarChart3, label: "Decisão", description: "Defina estratégias e indicadores financeiros" },
  { icon: ClipboardList, label: "Execução", description: "Planeje iniciativas e mitigue riscos" },
  { icon: MessageSquare, label: "Storytelling", description: "Apresente para seu público-alvo" },
];

const DIFFICULTY_OPTIONS = [
  { value: "easy" as const, label: "Iniciante", description: "Cenários mais simples para começar" },
  { value: "medium" as const, label: "Intermediário", description: "Desafios equilibrados" },
  { value: "hard" as const, label: "Avançado", description: "Cenários complexos para executivos" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedMode, setSelectedMode] = useState<"solo" | "group">("solo");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const { data: stats } = useQuery<{ totalRounds: number; avgScore: number; bestScore: number; roundsCompleted: number }>({
    queryKey: ["/api/auth/stats"],
    enabled: isAuthenticated,
  });

  const createSessionMutation = useMutation({
    mutationFn: async ({ mode, difficulty }: { mode: "solo" | "group"; difficulty: "easy" | "medium" | "hard" }) => {
      const response = await apiRequest("POST", "/api/sessions", {
        mode,
        playerCount: mode === "solo" ? 1 : 3,
        difficulty,
      });
      return await response.json() as GameSession;
    },
    onSuccess: (session) => {
      setLocation(`/game/${session.id}`);
    },
  });

  const handleStartGame = () => {
    createSessionMutation.mutate({ mode: selectedMode, difficulty: selectedDifficulty });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-12">
          <div className="flex justify-end mb-4">
            {authLoading ? (
              <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                  <AvatarFallback>
                    {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">
                  {user.firstName || user.email?.split("@")[0]}
                </span>
                <Button variant="outline" size="sm" asChild data-testid="button-logout">
                  <a href="/api/logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </a>
                </Button>
              </div>
            ) : (
              <Button variant="default" asChild data-testid="button-login">
                <a href="/api/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </a>
              </Button>
            )}
          </div>
          
          <Badge variant="secondary" className="mb-4">
            Treinamento Executivo
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Executive Stories
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simulação em forma de baralho para treinar diagnóstico, tomada de decisão 
            e construção de narrativas de negócios.
          </p>
        </header>

        {isAuthenticated && stats && stats.roundsCompleted > 0 && (
          <Card className="mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-chart-5" />
                Seu Progresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold" data-testid="text-total-rounds">{stats.totalRounds}</div>
                  <div className="text-xs text-muted-foreground">Rodadas Iniciadas</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold" data-testid="text-completed-rounds">{stats.roundsCompleted}</div>
                  <div className="text-xs text-muted-foreground">Rodadas Completas</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold" data-testid="text-avg-score">{stats.avgScore}/12</div>
                  <div className="text-xs text-muted-foreground">Pontuação Média</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-chart-5/10">
                  <div className="text-2xl font-bold text-chart-5" data-testid="text-best-score">{stats.bestScore}/12</div>
                  <div className="text-xs text-muted-foreground">Melhor Pontuação</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="lg:row-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">Iniciar Nova Sessão</CardTitle>
              <CardDescription>
                Escolha o modo de jogo e comece a treinar suas habilidades executivas
                {!isAuthenticated && (
                  <span className="block mt-1 text-xs">
                    Entre para salvar seu progresso e acompanhar sua evolução
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Modo de Jogo</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    className={`p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                      selectedMode === "solo"
                        ? "border-primary bg-primary/5"
                        : "border-muted"
                    }`}
                    onClick={() => setSelectedMode("solo")}
                    data-testid="button-mode-solo"
                  >
                    <PlayCircle className={`h-8 w-8 mb-3 ${selectedMode === "solo" ? "text-primary" : "text-muted-foreground"}`} />
                    <h3 className="font-semibold mb-1">Modo Solo</h3>
                    <p className="text-sm text-muted-foreground">
                      Treine individualmente no seu ritmo
                    </p>
                  </button>
                  <button
                    className={`p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                      selectedMode === "group"
                        ? "border-primary bg-primary/5"
                        : "border-muted"
                    }`}
                    onClick={() => setSelectedMode("group")}
                    data-testid="button-mode-group"
                  >
                    <Users className={`h-8 w-8 mb-3 ${selectedMode === "group" ? "text-primary" : "text-muted-foreground"}`} />
                    <h3 className="font-semibold mb-1">Modo Grupo</h3>
                    <p className="text-sm text-muted-foreground">
                      Workshop ou competição amigável
                    </p>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nível de Dificuldade</label>
                <div className="grid grid-cols-3 gap-3">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className={`p-3 rounded-lg border-2 text-center transition-all hover-elevate ${
                        selectedDifficulty === option.value
                          ? "border-primary bg-primary/5"
                          : "border-muted"
                      }`}
                      onClick={() => setSelectedDifficulty(option.value)}
                      data-testid={`button-difficulty-${option.value}`}
                    >
                      <div className={`font-semibold text-sm ${selectedDifficulty === option.value ? "text-primary" : ""}`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleStartGame}
                disabled={createSessionMutation.isPending}
                data-testid="button-start-game"
              >
                {createSessionMutation.isPending ? (
                  "Iniciando..."
                ) : (
                  <>
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Iniciar Jogo
                  </>
                )}
              </Button>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Fluxo de uma Rodada
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {GAME_STEPS.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-sm font-medium">{step.label}</div>
                        <div className="text-xs text-muted-foreground">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-chart-5" />
                Objetivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-chart-5 mt-2 shrink-0" />
                  <span className="text-sm">Fazer diagnóstico estruturado de negócios</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-chart-5 mt-2 shrink-0" />
                  <span className="text-sm">Tomar decisões financeiras e estratégicas sob restrição</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-chart-5 mt-2 shrink-0" />
                  <span className="text-sm">Montar planos de execução realistas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-chart-5 mt-2 shrink-0" />
                  <span className="text-sm">Construir storytelling executivo claro e persuasivo</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sistema de Avaliação</CardTitle>
              <CardDescription>
                Feedback inteligente com IA para cada rodada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ao final de cada rodada, receba avaliação em 4 critérios (0-3 pontos cada):
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded-md bg-muted/50">Clareza de Diagnóstico</div>
                <div className="p-2 rounded-md bg-muted/50">Coerência Financeira</div>
                <div className="p-2 rounded-md bg-muted/50">Robustez do Plano</div>
                <div className="p-2 rounded-md bg-muted/50">Qualidade do Storytelling</div>
              </div>
              <div className="flex gap-2 flex-wrap text-xs">
                <Badge variant="secondary">0-4: Iniciante</Badge>
                <Badge variant="secondary">5-8: Intermediário</Badge>
                <Badge variant="secondary">9-12: Executivo</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-6 text-center">6 Baralhos, 60 Cartas</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DECK_FEATURES.map((deck, i) => {
              const Icon = deck.icon;
              return (
                <Card key={i} className="hover-elevate">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{deck.label}</h3>
                      <p className="text-sm text-muted-foreground">{deck.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
