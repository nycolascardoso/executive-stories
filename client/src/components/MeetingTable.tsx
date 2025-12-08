import type { Card, DeckType } from "@shared/schema";
import { DECK_INFO } from "@shared/cardData";
import { Briefcase, Lightbulb, BarChart3, ClipboardList, ShieldCheck, MessageSquare, Target, TrendingUp, Shield, Presentation } from "lucide-react";
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

const DECK_COLORS: Record<DeckType, { bg: string; text: string; glow: string; border: string }> = {
  C: { bg: "bg-amber-500/20", text: "text-amber-400", glow: "shadow-amber-500/40", border: "border-amber-500/50" },
  E: { bg: "bg-emerald-500/20", text: "text-emerald-400", glow: "shadow-emerald-500/40", border: "border-emerald-500/50" },
  F: { bg: "bg-cyan-500/20", text: "text-cyan-400", glow: "shadow-cyan-500/40", border: "border-cyan-500/50" },
  P: { bg: "bg-blue-500/20", text: "text-blue-400", glow: "shadow-blue-500/40", border: "border-blue-500/50" },
  G: { bg: "bg-purple-500/20", text: "text-purple-400", glow: "shadow-purple-500/40", border: "border-purple-500/50" },
  S: { bg: "bg-pink-500/20", text: "text-pink-400", glow: "shadow-pink-500/40", border: "border-pink-500/50" },
};

const SLOT_CONFIG: { key: string; label: string; icon: React.ElementType; cardKey: string; position: { top?: string; bottom?: string; left?: string; right?: string } }[] = [
  { key: "context-slot", label: "Diagnóstico", icon: Target, cardKey: "context", position: { top: "10%", left: "15%" } },
  { key: "strategy-slot", label: "Estratégia", icon: Lightbulb, cardKey: "strategy", position: { top: "10%", left: "42.5%" } },
  { key: "finance-slot", label: "Financeiro", icon: BarChart3, cardKey: "finance", position: { top: "10%", right: "15%" } },
  { key: "project-slot", label: "Projetos", icon: ClipboardList, cardKey: "project", position: { bottom: "10%", left: "15%" } },
  { key: "governance-slot", label: "Riscos", icon: Shield, cardKey: "governance", position: { bottom: "10%", left: "42.5%" } },
  { key: "storytelling-slot", label: "Storytelling", icon: Presentation, cardKey: "storytelling", position: { bottom: "10%", right: "15%" } },
];

interface TableCardProps {
  card: Card;
  onRemove: () => void;
}

function TableCard({ card, onRemove }: TableCardProps) {
  const colors = DECK_COLORS[card.deckType];
  const deckInfo = DECK_INFO[card.deckType];
  
  return (
    <motion.div
      className={`w-24 h-32 rounded-xl border-2 ${colors.border} ${colors.bg} backdrop-blur-sm 
        flex flex-col items-center justify-between p-2 cursor-pointer shadow-lg ${colors.glow}`}
      initial={{ scale: 0, rotate: -10, y: 50 }}
      animate={{ scale: 1, rotate: 0, y: 0 }}
      exit={{ scale: 0, rotate: 10, y: 50 }}
      whileHover={{ scale: 1.05, y: -5 }}
      onClick={onRemove}
      data-testid={`table-card-${card.id}`}
    >
      <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
        <span className={colors.text}>{DECK_ICONS[card.deckType]}</span>
      </div>
      
      <div className="text-center">
        <h4 className="text-[10px] font-display font-semibold leading-tight line-clamp-2">
          {card.name}
        </h4>
      </div>
      
      <span className={`text-[8px] font-medium ${colors.text}`}>
        {deckInfo.name}
      </span>
    </motion.div>
  );
}

interface DroppableSlotProps {
  slotKey: string;
  label: string;
  icon: React.ElementType;
  cardKey: string;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  card?: Card;
  onRemoveCard: () => void;
}

function DroppableSlot({ slotKey, label, icon: SlotIcon, cardKey, position, card, onRemoveCard }: DroppableSlotProps) {
  const { isOver, setNodeRef, active } = useDroppable({
    id: slotKey,
    data: { cardKey },
  });

  const isValidDrop = active?.data?.current?.cardKey === cardKey;
  const isHighlighted = isOver && isValidDrop;
  
  return (
    <div
      ref={setNodeRef}
      className="absolute"
      style={position as React.CSSProperties}
      data-testid={`table-slot-${cardKey}`}
    >
      <motion.div
        className={`w-28 h-36 rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center
          ${card ? 'border-transparent' : isHighlighted ? 'border-primary bg-primary/20 scale-105' : isOver ? 'border-destructive/50 bg-destructive/10' : 'border-border/30 bg-black/20'}`}
        animate={{ 
          scale: isHighlighted ? 1.05 : 1,
        }}
      >
        <AnimatePresence mode="wait">
          {card ? (
            <TableCard key={card.id} card={card} onRemove={onRemoveCard} />
          ) : (
            <motion.div 
              key="empty"
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SlotIcon className={`h-6 w-6 mx-auto mb-2 ${isHighlighted ? 'text-primary' : 'text-muted-foreground/40'}`} />
              <span className={`text-[10px] font-medium ${isHighlighted ? 'text-primary' : 'text-muted-foreground/40'}`}>
                {label}
              </span>
              {isOver && !isValidDrop && (
                <span className="block text-[9px] text-destructive/60 mt-1">
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
      className="relative h-full w-full"
      data-testid="meeting-table"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(20_15%_12%)_0%,_transparent_70%)] opacity-60" />
      
      <div className="absolute inset-8 border border-border/20 rounded-3xl bg-gradient-to-b from-stone-900/40 to-stone-950/40">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMzAgMCBMNjAgMzAgTDMwIDYwIEwwIDMwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')] opacity-50 rounded-3xl" />
      </div>
      
      <div className="relative h-full w-full p-8">
        {SLOT_CONFIG.map((slot) => (
          <DroppableSlot
            key={slot.key}
            slotKey={slot.key}
            label={slot.label}
            icon={slot.icon}
            cardKey={slot.cardKey}
            position={slot.position}
            card={getCardForSlot(slot.cardKey)}
            onRemoveCard={() => onRemoveCard(slot.cardKey)}
          />
        ))}
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto mb-2">
            <span className="font-display text-2xl font-bold text-primary/40">ES</span>
          </div>
          <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">
            Mesa de Reunião
          </p>
        </div>
      </div>
      
      {tableCards.length > 0 && (
        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
          <span className="font-mono-game text-primary">{tableCards.length}</span>/6 cartas na mesa
        </div>
      )}
    </div>
  );
}
