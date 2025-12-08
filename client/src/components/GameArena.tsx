import { useState, useCallback } from "react";
import type { Card, DrawnCards, GameStep } from "@shared/schema";
import { CardHand } from "./CardHand";
import { MeetingTable } from "./MeetingTable";
import { ExecutiveAvatars, BossModeToggle } from "./ExecutiveAvatars";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateExecutiveQuestions } from "@/lib/executiveQuestions";
import { DndContext, DragEndEvent, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";

interface GameArenaProps {
  cards: DrawnCards;
  currentStep: GameStep;
  onProceedToResponse: (tableCards: string[]) => void;
  roundNumber: number;
}

export function GameArena({ cards, currentStep, onProceedToResponse, roundNumber }: GameArenaProps) {
  const [tableCards, setTableCards] = useState<string[]>([]);
  const [bossMode, setBossMode] = useState(false);
  const [speakingExecutive, setSpeakingExecutive] = useState<string | undefined>();
  const [executiveQuestions, setExecutiveQuestions] = useState<Record<string, string>>({});
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

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

  const triggerBossQuestions = useCallback((newTableCards: string[]) => {
    const tableCardsData = newTableCards.map(key => {
      const item = cardArray.find(c => c.key === key);
      return item ? { key, card: item.card } : null;
    }).filter(Boolean) as { key: string; card: Card }[];
    
    setTimeout(() => {
      const questions = generateExecutiveQuestions(tableCardsData);
      if (questions.length > 0) {
        const questionMap = questions.reduce((acc, q) => {
          acc[q.executiveId] = q.question;
          return acc;
        }, {} as Record<string, string>);
        setExecutiveQuestions(questionMap);
        setSpeakingExecutive(questions[0].executiveId);
      }
    }, 500);
  }, [cardArray]);

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
        
        if (bossMode) {
          triggerBossQuestions(newTableCards);
        }
      }
    }
  };

  const handleClickToPlace = useCallback((cardKey: string) => {
    if (!tableCards.includes(cardKey)) {
      const newTableCards = [...tableCards, cardKey];
      setTableCards(newTableCards);
      console.log("Card clicked to place:", cardKey, newTableCards);
      
      if (bossMode) {
        triggerBossQuestions(newTableCards);
      }
    }
  }, [tableCards, bossMode, triggerBossQuestions]);

  const handleRemoveFromTable = useCallback((key: string) => {
    setTableCards(prev => prev.filter(k => k !== key));
  }, []);

  const handleProceed = () => {
    onProceedToResponse(tableCards.length > 0 ? tableCards : cardArray.map(c => c.key));
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

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col" data-testid="game-arena">
        <div className="h-[20%] min-h-[120px] border-b border-border/20 bg-gradient-to-b from-black/30 to-transparent relative">
          <div className="absolute top-2 right-4 z-10">
            <BossModeToggle isActive={bossMode} onToggle={() => setBossMode(!bossMode)} />
          </div>
          <ExecutiveAvatars
            isActive={bossMode}
            speakingExecutive={speakingExecutive}
            questions={executiveQuestions}
            onDismissQuestion={handleDismissQuestion}
          />
        </div>
        
        <div className="h-[55%] min-h-[300px] relative">
          <MeetingTable
            cards={cardArray}
            tableCards={tableCards}
            onRemoveCard={handleRemoveFromTable}
          />
          
          <AnimatePresence>
            {tableCards.length > 0 && (
              <motion.div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Button
                  size="lg"
                  className="btn-game-primary text-primary-foreground font-semibold px-8 shadow-lg"
                  onClick={handleProceed}
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
          
          {tableCards.length === 0 && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p className="text-sm text-muted-foreground/60 max-w-xs">
                Arraste as cartas da sua mão para os slots correspondentes na mesa
              </p>
            </motion.div>
          )}
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
