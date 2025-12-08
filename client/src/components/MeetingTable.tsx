import type { Card, DeckType } from "@shared/schema";
import { DECK_INFO } from "@shared/cardData";
import { Briefcase, Lightbulb, BarChart3, ClipboardList, ShieldCheck, MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDroppable } from "@dnd-kit/core";

const DECK_ICONS: Record<DeckType, React.ReactNode> = {
  C: <Briefcase className="h-4 w-4" />,
  E: <Lightbulb className="h-4 w-4" />,
  F: <BarChart3 className="h-4 w-4" />,
  P: <ClipboardList className="h-4 w-4" />,
  G: <ShieldCheck className="h-4 w-4" />,
  S: <MessageSquare className="h-4 w-4" />,
};

const DECK_COLORS: Record<DeckType, { bg: string; text: string; glow: string; border: string; shadow: string }> = {
  C: { bg: "bg-amber-500/20", text: "text-amber-400", glow: "shadow-amber-500/50", border: "border-amber-500/60", shadow: "0 0 20px rgba(245,158,11,0.3)" },
  E: { bg: "bg-emerald-500/20", text: "text-emerald-400", glow: "shadow-emerald-500/50", border: "border-emerald-500/60", shadow: "0 0 20px rgba(16,185,129,0.3)" },
  F: { bg: "bg-cyan-500/20", text: "text-cyan-400", glow: "shadow-cyan-500/50", border: "border-cyan-500/60", shadow: "0 0 20px rgba(6,182,212,0.3)" },
  P: { bg: "bg-blue-500/20", text: "text-blue-400", glow: "shadow-blue-500/50", border: "border-blue-500/60", shadow: "0 0 20px rgba(59,130,246,0.3)" },
  G: { bg: "bg-purple-500/20", text: "text-purple-400", glow: "shadow-purple-500/50", border: "border-purple-500/60", shadow: "0 0 20px rgba(168,85,247,0.3)" },
  S: { bg: "bg-pink-500/20", text: "text-pink-400", glow: "shadow-pink-500/50", border: "border-pink-500/60", shadow: "0 0 20px rgba(236,72,153,0.3)" },
};

const SLOT_POSITIONS = [
  { gridArea: "1 / 1", cardKey: "context" },
  { gridArea: "1 / 2", cardKey: "strategy" },
  { gridArea: "1 / 3", cardKey: "finance" },
  { gridArea: "2 / 1", cardKey: "project" },
  { gridArea: "2 / 2", cardKey: "governance" },
  { gridArea: "2 / 3", cardKey: "storytelling" },
];

const SLOT_LABELS: Record<string, string> = {
  context: "Contexto",
  strategy: "Estratégia", 
  finance: "Finanças",
  project: "Projetos",
  governance: "Governança",
  storytelling: "Storytelling",
};

interface TableCardProps {
  card: Card;
  onRemove: () => void;
}

function TableCard({ card, onRemove }: TableCardProps) {
  const colors = DECK_COLORS[card.deckType];
  const deckInfo = DECK_INFO[card.deckType];
  
  return (
    <motion.div
      className="relative w-full h-full"
      initial={{ scale: 0, rotateY: 180 }}
      animate={{ scale: 1, rotateY: 0 }}
      exit={{ scale: 0, rotateY: -180 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div 
        className={`w-full h-full rounded-xl border-2 ${colors.border} ${colors.bg} backdrop-blur-md 
          flex flex-col items-center justify-between p-3 cursor-pointer relative overflow-hidden group`}
        style={{ boxShadow: colors.shadow }}
        onClick={onRemove}
        data-testid={`table-card-${card.id}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        <motion.button
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center 
            opacity-0 group-hover:opacity-100 transition-opacity z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-3 w-3 text-white/70" />
        </motion.button>
        
        <div className={`w-10 h-10 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center`}>
          <span className={colors.text}>{DECK_ICONS[card.deckType]}</span>
        </div>
        
        <div className="text-center flex-1 flex flex-col justify-center py-1">
          <span className={`text-[9px] font-mono-game uppercase tracking-wider ${colors.text} opacity-70`}>
            {card.id}
          </span>
          <h4 className="text-[11px] font-display font-semibold leading-tight line-clamp-2 mt-0.5">
            {card.name}
          </h4>
        </div>
        
        <span className={`text-[9px] font-medium ${colors.text} opacity-80`}>
          {deckInfo.name}
        </span>
      </div>
    </motion.div>
  );
}

interface DroppableSlotProps {
  cardKey: string;
  card?: Card;
  onRemoveCard: () => void;
  gridArea: string;
}

function DroppableSlot({ cardKey, card, onRemoveCard, gridArea }: DroppableSlotProps) {
  const slotKey = `${cardKey}-slot`;
  const { isOver, setNodeRef, active } = useDroppable({
    id: slotKey,
    data: { cardKey },
  });

  const isValidDrop = active?.data?.current?.cardKey === cardKey;
  const isHighlighted = isOver && isValidDrop;
  const label = SLOT_LABELS[cardKey];
  
  return (
    <div
      ref={setNodeRef}
      className="relative"
      style={{ gridArea }}
      data-testid={`table-slot-${cardKey}`}
    >
      <motion.div
        className={`w-full h-full rounded-xl transition-all duration-200 flex flex-col items-center justify-center
          ${card ? 'bg-transparent' : isHighlighted 
            ? 'border-2 border-primary bg-primary/15 shadow-[0_0_30px_rgba(245,158,11,0.2)]' 
            : isOver 
              ? 'border-2 border-dashed border-destructive/40 bg-destructive/5' 
              : 'border-2 border-dashed border-border/30 bg-black/20 hover:border-border/50 hover:bg-black/30'
          }`}
        animate={{ 
          scale: isHighlighted ? 1.02 : 1,
        }}
      >
        <AnimatePresence mode="wait">
          {card ? (
            <TableCard key={card.id} card={card} onRemove={onRemoveCard} />
          ) : (
            <motion.div 
              key="empty"
              className="text-center p-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={`w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center
                ${isHighlighted ? 'bg-primary/20' : 'bg-white/5'}`}
              >
                <span className={`text-lg ${isHighlighted ? 'text-primary' : 'text-muted-foreground/30'}`}>
                  {cardKey[0].toUpperCase()}
                </span>
              </div>
              <span className={`text-[10px] font-medium block ${isHighlighted ? 'text-primary' : 'text-muted-foreground/40'}`}>
                {label}
              </span>
              {isOver && !isValidDrop && (
                <span className="block text-[9px] text-destructive/70 mt-1">
                  Carta incorreta
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

interface MeetingTableProps {
  cards: { key: string; card: Card }[];
  tableCards: string[];
  onRemoveCard: (cardKey: string) => void;
}

export function MeetingTable({ cards, tableCards, onRemoveCard }: MeetingTableProps) {
  const getCardForSlot = (cardKey: string) => {
    if (!tableCards.includes(cardKey)) return undefined;
    return cards.find(c => c.key === cardKey)?.card;
  };

  return (
    <div 
      className="relative h-full w-full overflow-hidden"
      data-testid="meeting-table"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-900/60 to-stone-950/80" />
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(350_35%_15%/0.3)_0%,_transparent_60%)]" />
      
      <div className="absolute inset-4 md:inset-6 rounded-2xl border border-primary/10 bg-gradient-to-br from-stone-900/50 to-stone-950/50 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(139, 92, 42, 0.03) 2px,
              rgba(139, 92, 42, 0.03) 4px
            )`
          }} />
        </div>
        
        <div className="absolute inset-0 rounded-2xl" style={{
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5), inset 0 0 20px rgba(139, 92, 42, 0.1)'
        }} />
      </div>
      
      <div className="relative h-full w-full flex items-center justify-center p-6 md:p-10">
        <div 
          className="grid gap-3 md:gap-4 w-full max-w-2xl mx-auto"
          style={{
            gridTemplateColumns: 'repeat(3, minmax(90px, 1fr))',
            gridTemplateRows: 'repeat(2, minmax(120px, 1fr))',
          }}
        >
          {SLOT_POSITIONS.map((slot) => (
            <DroppableSlot
              key={slot.cardKey}
              cardKey={slot.cardKey}
              gridArea={slot.gridArea}
              card={getCardForSlot(slot.cardKey)}
              onRemoveCard={() => onRemoveCard(slot.cardKey)}
            />
          ))}
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
          <motion.div 
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 
              border border-primary/20 flex items-center justify-center"
            animate={{ 
              boxShadow: ['0 0 20px rgba(245,158,11,0.1)', '0 0 40px rgba(245,158,11,0.2)', '0 0 20px rgba(245,158,11,0.1)']
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="font-display text-xl md:text-2xl font-bold text-primary/30">ES</span>
          </motion.div>
        </div>
      </div>
      
      <AnimatePresence>
        {tableCards.length > 0 && (
          <motion.div 
            className="absolute bottom-3 right-4 flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < tableCards.length ? 'bg-primary' : 'bg-border/30'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              <span className="font-mono-game text-primary">{tableCards.length}</span>/6
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
