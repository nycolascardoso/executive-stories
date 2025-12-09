import { useState, useCallback, useRef, useEffect } from "react";
import type { Card, DrawnCards, GameStep, Difficulty } from "@shared/schema";
import { CardHand } from "./CardHand";
import { MeetingTable } from "./MeetingTable";
import { ExecutiveAvatars, BossModeToggle, getExecutiveIds } from "./ExecutiveAvatars";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, X, Mic, MicOff, Send, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateExecutiveQuestions } from "@/lib/executiveQuestions";
import { DndContext, DragEndEvent, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";

type RoundPhase = "SELECAO_CARTAS" | "ARGUMENTACAO" | "PERGUNTAS_BOSSES" | "RESPOSTAS_AOS_BOSSES";

interface GameArenaProps {
  cards: DrawnCards;
  currentStep: GameStep;
  onProceedToResponse: (tableCards: string[], responses: Record<string, string>) => void;
  roundNumber: number;
  isSubmitting?: boolean;
  difficulty?: Difficulty;
}

const DIFFICULTY_CONFIG: Record<Difficulty, { minCards: number; autoBossMode: boolean }> = {
  iniciante: { minCards: 1, autoBossMode: false },
  intermediario: { minCards: 3, autoBossMode: true },
  avancado: { minCards: 3, autoBossMode: true },
};

export function GameArena({ cards, currentStep, onProceedToResponse, roundNumber, isSubmitting = false, difficulty = "iniciante" }: GameArenaProps) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const [tableCards, setTableCards] = useState<string[]>([]);
  const [bossMode, setBossMode] = useState(config.autoBossMode);
  const [cardWarning, setCardWarning] = useState<string | null>(null);
  const [speakingExecutive, setSpeakingExecutive] = useState<string | undefined>();
  const [executiveQuestions, setExecutiveQuestions] = useState<Record<string, string>>({});
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  
  const [roundPhase, setRoundPhase] = useState<RoundPhase>("SELECAO_CARTAS");
  const [responses, setResponses] = useState({
    diagnostico: "",
    decisoes: "",
    execucao: "",
    storytelling: "",
  });
  const [bossResponses, setBossResponses] = useState<Record<string, string>>({});
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100,
      tolerance: 5,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const cardArray = [
    { key: "context", card: cards.context },
    { key: "strategy", card: cards.strategy },
    { key: "finance", card: cards.finance },
    { key: "project", card: cards.project },
    { key: "governance", card: cards.governance },
    { key: "storytelling", card: cards.storytelling },
  ];

  useEffect(() => {
    if (currentStep === "cards" && roundPhase !== "SELECAO_CARTAS" && roundPhase !== "ARGUMENTACAO" && roundPhase !== "PERGUNTAS_BOSSES") {
      setRoundPhase("SELECAO_CARTAS");
    }
  }, [currentStep, roundPhase]);

  useEffect(() => {
    setBossMode(config.autoBossMode);
  }, [config.autoBossMode, difficulty]);

  const executiveIds = getExecutiveIds(difficulty);

  const triggerBossQuestions = useCallback((playerResponses: typeof responses) => {
    const tableCardsData = tableCards.map(key => {
      const item = cardArray.find(c => c.key === key);
      return item ? { key, card: item.card } : null;
    }).filter(Boolean) as { key: string; card: Card }[];
    
    setTimeout(() => {
      const questions = generateExecutiveQuestions(tableCardsData, playerResponses, executiveIds);
      if (questions.length > 0) {
        const questionMap = questions.reduce((acc, q) => {
          acc[q.executiveId] = q.question;
          return acc;
        }, {} as Record<string, string>);
        setExecutiveQuestions(questionMap);
        setSpeakingExecutive(questions[0].executiveId);
        setBossResponses({});
      }
    }, 500);
  }, [cardArray, tableCards, executiveIds]);

  const handleDragStart = (event: { active: { id: string | number } }) => {
    setActiveCardId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCardId(null);
    const { active, over } = event;
    
    if (!over) return;

    const draggedCardKey = String(active.id);
    const targetSlotCardKey = over.data?.current?.cardKey;
    
    console.log("Drag end:", { draggedCardKey, targetSlotCardKey, overId: over.id });

    if (targetSlotCardKey && draggedCardKey === targetSlotCardKey) {
      if (!tableCards.includes(draggedCardKey)) {
        const newTableCards = [...tableCards, draggedCardKey];
        setTableCards(newTableCards);
        console.log("Card placed on table:", draggedCardKey, newTableCards);
      }
    }
  };

  const handleClickToPlace = useCallback((cardKey: string) => {
    if (!tableCards.includes(cardKey)) {
      const newTableCards = [...tableCards, cardKey];
      setTableCards(newTableCards);
      console.log("Card clicked to place:", cardKey, newTableCards);
    }
  }, [tableCards]);

  const handleRemoveFromTable = useCallback((key: string) => {
    setTableCards(prev => prev.filter(k => k !== key));
  }, []);

  const handleOpenArgumentation = () => {
    if (tableCards.length < config.minCards) {
      setCardWarning(`Selecione pelo menos ${config.minCards} carta${config.minCards > 1 ? 's' : ''} para ${difficulty === 'iniciante' ? 'continuar' : 'este nível de dificuldade'}`);
      setTimeout(() => setCardWarning(null), 3000);
      return;
    }
    setCardWarning(null);
    setRoundPhase("ARGUMENTACAO");
  };

  const handleCloseArgumentation = () => {
    setRoundPhase("SELECAO_CARTAS");
  };

  const handleResponseChange = (field: keyof typeof responses, value: string) => {
    setResponses(prev => ({ ...prev, [field]: value }));
  };

  const handleVoiceTranscript = (field: keyof typeof responses, transcript: string) => {
    setResponses(prev => ({ ...prev, [field]: prev[field] + " " + transcript }));
  };

  const handleSendToBosses = () => {
    const cardsToUse = tableCards.length > 0 ? tableCards : [];
    
    if (cardsToUse.length < config.minCards) {
      setCardWarning(`Selecione pelo menos ${config.minCards} carta${config.minCards > 1 ? 's' : ''}`);
      setTimeout(() => setCardWarning(null), 3000);
      return;
    }
    
    if (bossMode) {
      triggerBossQuestions(responses);
      setRoundPhase("PERGUNTAS_BOSSES");
    } else {
      onProceedToResponse(cardsToUse, responses);
      setRoundPhase("SELECAO_CARTAS");
      setActiveVoiceField(null);
    }
  };

  const handleBossResponseChange = (executiveId: string, value: string) => {
    setBossResponses(prev => ({ ...prev, [executiveId]: value }));
  };

  const handleSubmitBossResponses = () => {
    const cardsToUse = tableCards.length > 0 ? tableCards : [];
    
    if (cardsToUse.length < config.minCards) {
      setCardWarning(`Selecione pelo menos ${config.minCards} carta${config.minCards > 1 ? 's' : ''}`);
      setTimeout(() => setCardWarning(null), 3000);
      return;
    }
    
    onProceedToResponse(cardsToUse, { ...responses, bossResponses: JSON.stringify(bossResponses) });
    setRoundPhase("SELECAO_CARTAS");
    setActiveVoiceField(null);
    setExecutiveQuestions({});
    setBossResponses({});
    setSpeakingExecutive(undefined);
  };

  const handleDismissQuestion = (executiveId: string) => {
    setExecutiveQuestions(prev => {
      const next = { ...prev };
      delete next[executiveId];
      return next;
    });
    setSpeakingExecutive(undefined);
  };

  const activeCard = activeCardId ? cardArray.find(c => c.key === activeCardId)?.card : null;

  const tableCardsData = tableCards.map(key => {
    const item = cardArray.find(c => c.key === key);
    return item ? item.card : null;
  }).filter(Boolean) as Card[];

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col relative" data-testid="game-arena">
        <div className="h-[20%] min-h-[120px] border-b border-border/20 bg-gradient-to-b from-black/30 to-transparent relative">
          <div className="absolute top-2 right-4 z-10">
            <BossModeToggle isActive={bossMode} onToggle={() => setBossMode(!bossMode)} />
          </div>
          <ExecutiveAvatars
            isActive={bossMode}
            speakingExecutive={speakingExecutive}
            questions={executiveQuestions}
            onDismissQuestion={handleDismissQuestion}
            difficulty={difficulty}
          />
        </div>
        
        <div className="h-[55%] min-h-[300px] relative">
          <MeetingTable
            cards={cardArray}
            tableCards={tableCards}
            onRemoveCard={handleRemoveFromTable}
          />
          
          <AnimatePresence>
            {tableCards.length > 0 && roundPhase === "SELECAO_CARTAS" && (
              <motion.div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Button
                  size="lg"
                  className="btn-game-primary text-primary-foreground font-semibold px-8 shadow-lg"
                  onClick={handleOpenArgumentation}
                  data-testid="button-proceed-to-response"
                >
                  <span className="flex items-center gap-2">
                    Montar Argumentação
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {tableCards.length === 0 && roundPhase === "SELECAO_CARTAS" && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p className="text-sm text-muted-foreground/60 max-w-xs">
                Clique nas cartas da sua mão para colocá-las na mesa
              </p>
              {config.minCards > 1 && (
                <p className="text-xs text-amber-400/70 mt-2">
                  Mínimo: {config.minCards} cartas ({difficulty})
                </p>
              )}
            </motion.div>
          )}
          
          <AnimatePresence>
            {cardWarning && (
              <motion.div
                className="absolute top-4 left-1/2 -translate-x-1/2 z-30"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
                  {cardWarning}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="h-[25%] min-h-[180px] relative bg-gradient-to-t from-black/50 to-transparent">
          <div className="absolute top-2 left-4 z-10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-display font-semibold text-foreground">Rodada {roundNumber}</span>
              <span className="text-border">|</span>
              <span>Sua Mão</span>
            </div>
          </div>
          
          <CardHand
            cards={cardArray}
            tableCards={tableCards}
            onClickCard={handleClickToPlace}
          />
        </div>

        <AnimatePresence>
          {roundPhase === "ARGUMENTACAO" && (
            <ArgumentationOverlay
              cards={tableCardsData}
              responses={responses}
              onResponseChange={handleResponseChange}
              onVoiceTranscript={handleVoiceTranscript}
              activeVoiceField={activeVoiceField}
              setActiveVoiceField={setActiveVoiceField}
              onClose={handleCloseArgumentation}
              onSubmit={handleSendToBosses}
              bossMode={bossMode}
            />
          )}
          
          {roundPhase === "PERGUNTAS_BOSSES" && (
            <BossQuestionsOverlay
              questions={executiveQuestions}
              responses={bossResponses}
              onResponseChange={handleBossResponseChange}
              onSubmit={handleSubmitBossResponses}
              activeVoiceField={activeVoiceField}
              setActiveVoiceField={setActiveVoiceField}
            />
          )}
          
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="text-center space-y-4">
                <motion.div
                  className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary mx-auto"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-lg font-display text-foreground">Avaliando sua resposta...</p>
                <p className="text-sm text-muted-foreground">A IA está analisando seu desempenho</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DragOverlay>
        {activeCard && (
          <DragOverlayCard card={activeCard} />
        )}
      </DragOverlay>
    </DndContext>
  );
}

function DragOverlayCard({ card }: { card: Card }) {
  const DECK_COLORS: Record<string, { bg: string; text: string; glow: string; border: string }> = {
    C: { bg: "bg-amber-500/20", text: "text-amber-400", glow: "shadow-amber-500/30", border: "border-amber-500/40" },
    E: { bg: "bg-emerald-500/20", text: "text-emerald-400", glow: "shadow-emerald-500/30", border: "border-emerald-500/40" },
    F: { bg: "bg-cyan-500/20", text: "text-cyan-400", glow: "shadow-cyan-500/30", border: "border-cyan-500/40" },
    P: { bg: "bg-blue-500/20", text: "text-blue-400", glow: "shadow-blue-500/30", border: "border-blue-500/40" },
    G: { bg: "bg-purple-500/20", text: "text-purple-400", glow: "shadow-purple-500/30", border: "border-purple-500/40" },
    S: { bg: "bg-pink-500/20", text: "text-pink-400", glow: "shadow-pink-500/30", border: "border-pink-500/40" },
  };

  const colors = DECK_COLORS[card.deckType];

  return (
    <div 
      className={`w-28 h-40 rounded-xl border-2 ${colors.border} ${colors.bg} backdrop-blur-sm 
        flex flex-col items-center justify-between p-3 shadow-xl ${colors.glow} opacity-90 scale-110`}
    >
      <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
        <span className={`${colors.text} text-lg`}>{card.id[0]}</span>
      </div>
      
      <div className="text-center flex-1 flex flex-col justify-center">
        <span className={`text-[10px] font-mono-game uppercase tracking-wider ${colors.text}`}>
          {card.id}
        </span>
        <h4 className="text-xs font-display font-semibold leading-tight mt-1 line-clamp-2">
          {card.name}
        </h4>
      </div>
    </div>
  );
}

const DECK_COLORS: Record<string, { bg: string; text: string; glow: string; border: string }> = {
  C: { bg: "bg-amber-500/20", text: "text-amber-400", glow: "shadow-amber-500/30", border: "border-amber-500/40" },
  E: { bg: "bg-emerald-500/20", text: "text-emerald-400", glow: "shadow-emerald-500/30", border: "border-emerald-500/40" },
  F: { bg: "bg-cyan-500/20", text: "text-cyan-400", glow: "shadow-cyan-500/30", border: "border-cyan-500/40" },
  P: { bg: "bg-blue-500/20", text: "text-blue-400", glow: "shadow-blue-500/30", border: "border-blue-500/40" },
  G: { bg: "bg-purple-500/20", text: "text-purple-400", glow: "shadow-purple-500/30", border: "border-purple-500/40" },
  S: { bg: "bg-pink-500/20", text: "text-pink-400", glow: "shadow-pink-500/30", border: "border-pink-500/40" },
};

interface ArgumentationOverlayProps {
  cards: Card[];
  responses: { diagnostico: string; decisoes: string; execucao: string; storytelling: string };
  onResponseChange: (field: keyof ArgumentationOverlayProps["responses"], value: string) => void;
  onVoiceTranscript: (field: keyof ArgumentationOverlayProps["responses"], transcript: string) => void;
  activeVoiceField: string | null;
  setActiveVoiceField: (field: string | null) => void;
  onClose: () => void;
  onSubmit: () => void;
  bossMode: boolean;
}

function ArgumentationOverlay({ 
  cards, responses, onResponseChange, onVoiceTranscript,
  activeVoiceField, setActiveVoiceField, onClose, onSubmit, bossMode
}: ArgumentationOverlayProps) {
  const fields = [
    { key: "diagnostico" as const, label: "Diagnóstico", hint: "Analise o cenário e identifique os pontos críticos" },
    { key: "decisoes" as const, label: "Decisões", hint: "Defina suas decisões estratégicas e indicadores" },
    { key: "execucao" as const, label: "Execução", hint: "Descreva iniciativas concretas e mitigação de riscos" },
    { key: "storytelling" as const, label: "Storytelling", hint: "Construa sua narrativa executiva" },
  ];

  const hasContent = Object.values(responses).some(v => v.trim().length > 0);

  return (
    <motion.div
      className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl"
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      data-testid="argumentation-overlay"
    >
      <div className="h-full flex">
        <div className="w-48 shrink-0 border-r border-border/30 bg-black/30 p-4 overflow-y-auto">
          <h3 className="font-display text-sm font-semibold mb-4 text-muted-foreground">Cartas em Foco</h3>
          <div className="space-y-3">
            {cards.map((card) => {
              const colors = DECK_COLORS[card.deckType];
              return (
                <div 
                  key={card.id}
                  className={`p-3 rounded-lg border ${colors.border} ${colors.bg}`}
                >
                  <span className={`text-[10px] font-mono-game ${colors.text}`}>{card.id}</span>
                  <p className="text-xs font-medium mt-1 line-clamp-2">{card.name}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            <h2 className="font-display text-xl font-semibold">Montar Argumentação</h2>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-overlay">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">{field.label}</label>
                  <InlineMicButton
                    isActive={activeVoiceField === field.key}
                    onStart={() => setActiveVoiceField(field.key)}
                    onStop={() => setActiveVoiceField(null)}
                    onTranscript={(text) => onVoiceTranscript(field.key, text)}
                    fieldId={field.key}
                  />
                </div>
                <Textarea
                  value={responses[field.key]}
                  onChange={(e) => onResponseChange(field.key, e.target.value)}
                  placeholder={field.hint}
                  className="min-h-[100px] bg-black/20 border-border/30 resize-none"
                  data-testid={`input-${field.key}`}
                />
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border/30 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Voltar à Mesa
            </Button>
            <Button 
              onClick={onSubmit} 
              disabled={!hasContent}
              className="btn-game-primary"
              data-testid="button-send-to-bosses"
            >
              <span className="flex items-center gap-2">
                {bossMode ? "Enviar para Bosses" : "Concluir Argumentação"}
                <Send className="h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface BossQuestionsOverlayProps {
  questions: Record<string, string>;
  responses: Record<string, string>;
  onResponseChange: (executiveId: string, value: string) => void;
  onSubmit: () => void;
  activeVoiceField: string | null;
  setActiveVoiceField: (field: string | null) => void;
}

const EXECUTIVE_INFO: Record<string, { name: string; title: string; color: string }> = {
  ceo: { name: "CEO", title: "Chief Executive Officer", color: "text-amber-400" },
  cfo: { name: "CFO", title: "Chief Financial Officer", color: "text-cyan-400" },
  coo: { name: "COO", title: "Chief Operating Officer", color: "text-emerald-400" },
  board: { name: "Conselho", title: "Board of Directors", color: "text-purple-400" },
};

interface InlineMicButtonProps {
  isActive: boolean;
  onStart: () => void;
  onStop: () => void;
  onTranscript: (text: string) => void;
  fieldId?: string;
}

function InlineMicButton({ isActive, onStart, onStop, onTranscript, fieldId }: InlineMicButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    if (isActive && !isRecording) {
      startRecording();
    } else if (!isActive && isRecording) {
      stopRecording();
    }
    
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [isActive]);

  const startRecording = useCallback(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        lastActivityRef.current = Date.now();
      };
      
      recognition.onresult = (event: any) => {
        const result = event.results[0];
        if (result && result[0]) {
          const transcript = result[0].transcript.trim();
          if (transcript) {
            onTranscript(transcript);
          }
        }
        lastActivityRef.current = Date.now();
      };
      
      recognition.onerror = (event: any) => {
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
          console.error("Speech error:", event.error);
        }
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
        if (isActive) {
          restartTimeoutRef.current = setTimeout(() => {
            if (isActive) startRecording();
          }, 100);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      setIsRecording(false);
      onStop();
    }
  }, [fieldId, onTranscript, onStop, isActive]);

  const stopRecording = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const handleClick = () => {
    if (isActive) {
      stopRecording();
      onStop();
    } else {
      onStart();
    }
  };

  if (!isSupported) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        className="text-muted-foreground/50"
        title="Reconhecimento de voz não suportado"
      >
        <MicOff className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={`transition-colors ${isActive || isRecording ? "text-destructive bg-destructive/10" : ""}`}
      data-testid={`button-mic${fieldId ? `-${fieldId}` : ""}`}
      title={isActive ? "Parar gravação" : "Iniciar gravação de voz"}
    >
      {isActive || isRecording ? (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <MicOff className="h-4 w-4" />
        </motion.div>
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}

function BossQuestionsOverlay({ 
  questions, responses, onResponseChange, onSubmit, activeVoiceField, setActiveVoiceField 
}: BossQuestionsOverlayProps) {
  const questionEntries = Object.entries(questions);
  const allAnswered = questionEntries.every(([id]) => responses[id]?.trim().length > 0);

  return (
    <motion.div
      className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      data-testid="boss-questions-overlay"
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border/30">
          <h2 className="font-display text-xl font-semibold">Perguntas dos Executivos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Responda às perguntas dos executivos baseadas na sua argumentação
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {questionEntries.map(([executiveId, question]) => {
            const exec = EXECUTIVE_INFO[executiveId] || { name: executiveId, title: "", color: "text-foreground" };
            return (
              <div key={executiveId} className="space-y-3 p-4 rounded-xl bg-black/20 border border-border/30">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-black/40 flex items-center justify-center font-display font-bold ${exec.color}`}>
                    {exec.name[0]}
                  </div>
                  <div>
                    <span className={`font-semibold ${exec.color}`}>{exec.name}</span>
                    <p className="text-xs text-muted-foreground">{exec.title}</p>
                  </div>
                </div>
                
                <p className="text-sm italic border-l-2 border-border/50 pl-3">"{question}"</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Sua Resposta</label>
                    <InlineMicButton
                      isActive={activeVoiceField === executiveId}
                      onStart={() => setActiveVoiceField(executiveId)}
                      onStop={() => setActiveVoiceField(null)}
                      onTranscript={(text) => onResponseChange(executiveId, (responses[executiveId] || "") + " " + text)}
                      fieldId={`boss-${executiveId}`}
                    />
                  </div>
                  <Textarea
                    value={responses[executiveId] || ""}
                    onChange={(e) => onResponseChange(executiveId, e.target.value)}
                    placeholder="Digite ou dite sua resposta..."
                    className="min-h-[80px] bg-black/20 border-border/30 resize-none"
                    data-testid={`input-response-${executiveId}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-border/30 flex justify-end">
          <Button 
            onClick={onSubmit} 
            disabled={!allAnswered}
            className="btn-game-primary"
            data-testid="button-submit-boss-responses"
          >
            <span className="flex items-center gap-2">
              Concluir e Obter Feedback
              <ChevronRight className="h-4 w-4" />
            </span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
