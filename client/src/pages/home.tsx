import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  PlayCircle, 
  Briefcase, 
  Lightbulb, 
  BarChart3, 
  ClipboardList, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  Trophy,
  Zap,
  LogIn,
  LogOut,
  Star,
  User
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { GameSession, GuestProfile, Difficulty } from "@shared/schema";
import { motion } from "framer-motion";

const DECK_FEATURES = [
  { icon: Briefcase, label: "Contexto", glowClass: "card-glow-context", color: "text-amber-400" },
  { icon: Lightbulb, label: "Estratégia", glowClass: "card-glow-strategy", color: "text-emerald-400" },
  { icon: BarChart3, label: "Finanças", glowClass: "card-glow-finance", color: "text-cyan-400" },
  { icon: ClipboardList, label: "Projetos", glowClass: "card-glow-projects", color: "text-blue-400" },
  { icon: ShieldCheck, label: "Governança", glowClass: "card-glow-governance", color: "text-purple-400" },
  { icon: MessageSquare, label: "Storytelling", glowClass: "card-glow-storytelling", color: "text-pink-400" },
];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; stars: number; description: string }[] = [
  { value: "iniciante", label: "Iniciante", stars: 1, description: "Cenários mais simples, sem Boss Mode" },
  { value: "intermediario", label: "Intermediário", stars: 2, description: "Min. 3 cartas, Boss Mode ativo" },
  { value: "avancado", label: "Avançado", stars: 3, description: "Cenários complexos, Boss Mode intenso" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("intermediario");
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  
  const [guestProfileId, setGuestProfileId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("guestProfileId");
    }
    return null;
  });
  
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestForm, setGuestForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
  });

  const { data: guestProfile } = useQuery<GuestProfile>({
    queryKey: ["/api/guest-profiles", guestProfileId],
    enabled: !!guestProfileId && !isAuthenticated,
  });

  const { data: authStats } = useQuery<{ totalRounds: number; avgScore: number; bestScore: number; roundsCompleted: number }>({
    queryKey: ["/api/auth/stats"],
    enabled: isAuthenticated,
  });

  const { data: guestStats } = useQuery<{ totalRounds: number; avgScore: number; bestScore: number; roundsCompleted: number }>({
    queryKey: ["/api/guest-profiles", guestProfileId, "stats"],
    enabled: !!guestProfileId && !isAuthenticated,
  });

  const stats = isAuthenticated ? authStats : guestStats;
  const displayName = isAuthenticated 
    ? user?.firstName || user?.email?.split("@")[0]
    : guestProfile?.firstName;

  const createGuestProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; company: string }) => {
      const response = await apiRequest("POST", "/api/guest-profiles", data);
      return await response.json() as GuestProfile;
    },
    onSuccess: (profile) => {
      localStorage.setItem("guestProfileId", profile.id);
      setGuestProfileId(profile.id);
      setShowGuestForm(false);
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async ({ difficulty, guestProfileId }: { difficulty: Difficulty; guestProfileId?: string }) => {
      const response = await apiRequest("POST", "/api/sessions", {
        mode: "solo",
        playerCount: 1,
        difficulty,
        guestProfileId,
      });
      return await response.json() as GameSession;
    },
    onSuccess: (session) => {
      setLocation(`/game/${session.id}`);
    },
  });

  const handleStartGame = () => {
    if (!isAuthenticated && !guestProfileId) {
      setShowGuestForm(true);
      return;
    }
    createSessionMutation.mutate({ 
      difficulty: selectedDifficulty,
      guestProfileId: guestProfileId || undefined,
    });
  };

  const handleGuestFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestForm.firstName && guestForm.lastName && guestForm.company) {
      createGuestProfileMutation.mutate(guestForm);
    }
  };

  const handleClearGuestProfile = () => {
    localStorage.removeItem("guestProfileId");
    setGuestProfileId(null);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_hsl(20_8%_4%/0.8)_100%)] pointer-events-none" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-16">
        <header className="mb-16">
          <div className="flex justify-end mb-8">
            {authLoading ? (
              <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-primary/30">
                  <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block text-muted-foreground">
                  {user.firstName || user.email?.split("@")[0]}
                </span>
                <Button variant="ghost" size="sm" asChild data-testid="button-logout">
                  <a href="/api/logout">
                    <LogOut className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ) : guestProfile ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-primary/30">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {guestProfile.firstName[0]}{guestProfile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-muted-foreground">
                    {guestProfile.firstName} {guestProfile.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground/70">{guestProfile.company}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleClearGuestProfile} data-testid="button-clear-guest">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" asChild data-testid="button-login">
                <a href="/api/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </a>
              </Button>
            )}
          </div>
          
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">MBA Gamificado</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-4 bg-gradient-to-b from-foreground via-foreground to-muted-foreground bg-clip-text">
              Executive Stories
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Simulador executivo em forma de baralho. Decisões estratégicas, tensões financeiras 
              e narrativas persuasivas.
            </p>
          </motion.div>
        </header>

        {(isAuthenticated || guestProfile) && stats && stats.roundsCompleted > 0 && (
          <motion.div 
            className="mb-12 p-6 rounded-xl border-glow bg-card/50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-display text-lg font-semibold">
                {displayName ? `Progresso de ${displayName}` : "Seu Progresso"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="font-mono-game text-2xl font-bold text-primary" data-testid="text-total-rounds">{stats.totalRounds}</div>
                <div className="text-xs text-muted-foreground mt-1">Rodadas</div>
              </div>
              <div className="text-center">
                <div className="font-mono-game text-2xl font-bold" data-testid="text-completed-rounds">{stats.roundsCompleted}</div>
                <div className="text-xs text-muted-foreground mt-1">Completas</div>
              </div>
              <div className="text-center">
                <div className="font-mono-game text-2xl font-bold" data-testid="text-avg-score">{stats.avgScore}</div>
                <div className="text-xs text-muted-foreground mt-1">Média</div>
              </div>
              <div className="text-center">
                <div className="font-mono-game text-2xl font-bold text-emerald-400" data-testid="text-best-score">{stats.bestScore}</div>
                <div className="text-xs text-muted-foreground mt-1">Record</div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-semibold mb-2">6 Baralhos</h2>
            <p className="text-sm text-muted-foreground">60 cartas para treinar sua visão executiva</p>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {DECK_FEATURES.map((deck, i) => {
              const Icon = deck.icon;
              return (
                <motion.div
                  key={i}
                  className={`relative aspect-[3/4] rounded-xl bg-card border border-border/50 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-default ${deck.glowClass}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                  whileHover={{ scale: 1.05, y: -4 }}
                >
                  <Icon className={`h-8 w-8 ${deck.color}`} />
                  <span className="text-xs font-medium text-center">{deck.label}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="p-8 rounded-2xl border-glow bg-card/30">
            {showGuestForm ? (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <User className="h-12 w-12 mx-auto mb-3 text-primary" />
                  <h2 className="font-display text-2xl font-semibold mb-2">Identificação</h2>
                  <p className="text-sm text-muted-foreground">
                    Preencha seus dados para salvar seu progresso
                  </p>
                </div>
                
                <form onSubmit={handleGuestFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome</Label>
                      <Input
                        id="firstName"
                        value={guestForm.firstName}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Seu nome"
                        required
                        data-testid="input-guest-firstname"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Sobrenome</Label>
                      <Input
                        id="lastName"
                        value={guestForm.lastName}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Seu sobrenome"
                        required
                        data-testid="input-guest-lastname"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      value={guestForm.company}
                      onChange={(e) => setGuestForm(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Sua empresa"
                      required
                      data-testid="input-guest-company"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowGuestForm(false)}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 btn-game-primary"
                      disabled={createGuestProfileMutation.isPending}
                      data-testid="button-submit-guest"
                    >
                      {createGuestProfileMutation.isPending ? "Salvando..." : "Continuar"}
                    </Button>
                  </div>
                </form>
                
                <div className="mt-6 pt-6 border-t border-border/30 text-center">
                  <p className="text-xs text-muted-foreground mb-2">Ou entre com sua conta</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/api/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Entrar com Replit
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="font-display text-2xl font-semibold mb-6">Escolha seu Desafio</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary bg-primary/10">
                      <PlayCircle className="h-6 w-6 text-primary" />
                      <div>
                        <div className="font-semibold text-sm">Modo Solo</div>
                        <div className="text-xs text-muted-foreground">Treine no seu ritmo</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                            selectedDifficulty === option.value
                              ? "border-primary bg-primary/10"
                              : "border-border/50 bg-card/50 hover:border-border"
                          }`}
                          onClick={() => setSelectedDifficulty(option.value)}
                          data-testid={`button-difficulty-${option.value}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex gap-0.5">
                                {Array.from({ length: 3 }).map((_, idx) => (
                                  <Star 
                                    key={idx} 
                                    className={`h-4 w-4 ${idx < option.stars ? "text-primary fill-primary" : "text-muted-foreground/30"}`}
                                  />
                                ))}
                              </div>
                              <span className={`font-semibold ${selectedDifficulty === option.value ? "text-primary" : ""}`}>
                                {option.label}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 ml-[52px]">
                            {option.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full btn-game-primary text-primary-foreground font-semibold"
                    onClick={handleStartGame}
                    disabled={createSessionMutation.isPending}
                    data-testid="button-start-game"
                  >
                    {createSessionMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <motion.div 
                          className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Iniciando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Iniciar Jogo
                      </span>
                    )}
                  </Button>
                  
                  {!isAuthenticated && !guestProfile && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      Seus dados serão solicitados para salvar o progresso
                    </p>
                  )}
                </div>

                <div className="hidden md:block">
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                      <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Como Funciona
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-mono-game">1</span>
                          <span className="text-muted-foreground">Sorteie 6 cartas de cada baralho</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-mono-game">2</span>
                          <span className="text-muted-foreground">Selecione e analise o cenário</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-mono-game">3</span>
                          <span className="text-muted-foreground">Responda aos executivos (Boss Mode)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-mono-game">4</span>
                          <span className="text-muted-foreground">Receba avaliação detalhada com IA</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                      <h3 className="font-display text-sm font-semibold mb-3">Avaliação por Executivo</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-card/50">CEO - Visão</div>
                        <div className="p-2 rounded-lg bg-card/50">CFO - Finanças</div>
                        <div className="p-2 rounded-lg bg-card/50">COO - Execução</div>
                        <div className="p-2 rounded-lg bg-card/50">Board - Governança</div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground">
                        Feedback baseado em Harvard, MIT, Stanford
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.section>

        <footer className="text-center text-xs text-muted-foreground">
          <p>Treine sua visão executiva. Tome decisões melhores.</p>
        </footer>
      </div>
    </div>
  );
}
