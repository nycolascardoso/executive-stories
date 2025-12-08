import type { Card, DeckType } from "@shared/schema";
import { DECK_INFO } from "@shared/cardData";
import { Briefcase, Lightbulb, BarChart3, ClipboardList, ShieldCheck, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const DECK_ICONS: Record<DeckType, React.ReactNode> = {
  C: <Briefcase className="h-5 w-5" />,
  E: <Lightbulb className="h-5 w-5" />,
  F: <BarChart3 className="h-5 w-5" />,
  P: <ClipboardList className="h-5 w-5" />,
  G: <ShieldCheck className="h-5 w-5" />,
  S: <MessageSquare className="h-5 w-5" />,
};

const DECK_COLORS: Record<DeckType, { bg: string; text: string; glow: string; border: string }> = {
  C: { bg: "bg-amber-500/20", text: "text-amber-400", glow: "shadow-amber-500/30", border: "border-amber-500/40" },
  E: { bg: "bg-emerald-500/20", text: "text-emerald-400", glow: "shadow-emerald-500/30", border: "border-emerald-500/40" },
  F: { bg: "bg-cyan-500/20", text: "text-cyan-400", glow: "shadow-cyan-500/30", border: "border-cyan-500/40" },
  P: { bg: "bg-blue-500/20", text: "text-blue-400", glow: "shadow-blue-500/30", border: "border-blue-500/40" },
  G: { bg: "bg-purple-500/20", text: "text-purple-400", glow: "shadow-purple-500/30", border: "border-purple-500/40" },
  S: { bg: "bg-pink-500/20", text: "text-pink-400", glow: "shadow-pink-500/30", border: "border-pink-500/40" },
};

interface DraggableCardProps {
  cardKey: string;
  card: Card;
  index: number;
  total: number;
  isOnTable: boolean;
  onClick?: () => void;
}

function DraggableCard({ cardKey, card, index, total, isOnTable, onClick }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: cardKey,
    data: { card, cardKey },
    disabled: isOnTable,
  });

  const deckInfo = DECK_INFO[card.deckType];
  const colors = DECK_COLORS[card.deckType];
  
  const fanAngle = (index - (total - 1) / 2) * 6;
  const yOffset = Math.abs(index - (total - 1) / 2) * 8;
  
  if (isOnTable) {
    return null;
  }

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 100 : index,
  } : {
    zIndex: index,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <motion.div
      ref={setNodeRef}
      className={`absolute cursor-pointer select-none ${isDragging ? 'opacity-80' : ''}`}
      style={{
        left: `${50 + (index - (total - 1) / 2) * 12}%`,
        transform: `translateX(-50%) rotate(${fanAngle}deg)`,
        ...style,
      }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ 
        y: yOffset, 
        opacity: 1, 
        scale: isDragging ? 1.1 : 1,
      }}
      whileHover={{ 
        y: -20 + yOffset, 
        scale: 1.05,
        zIndex: 40,
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={handleClick}
      data-testid={`hand-card-${card.id}`}
    >
      <div 
        className={`w-28 h-40 rounded-xl border-2 ${colors.border} ${colors.bg} backdrop-blur-sm 
          flex flex-col items-center justify-between p-3 transition-shadow duration-300
          ${isDragging ? `shadow-xl ${colors.glow}` : 'shadow-md'}`}
      >
        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
          <span className={colors.text}>{DECK_ICONS[card.deckType]}</span>
        </div>
        
        <div className="text-center flex-1 flex flex-col justify-center">
          <span className={`text-[10px] font-mono-game uppercase tracking-wider ${colors.text}`}>
            {card.id}
          </span>
          <h4 className="text-xs font-display font-semibold leading-tight mt-1 line-clamp-2">
            {card.name}
          </h4>
        </div>
        
        <span className={`text-[9px] font-medium ${colors.text}`}>
          {deckInfo.name}
        </span>
      </div>
    </motion.div>
  );
}

interface CardHandProps {
  cards: { key: string; card: Card }[];
  tableCards: string[];
  onClickCard?: (cardKey: string) => void;
}

export function CardHand({ cards, tableCards, onClickCard }: CardHandProps) {
  const visibleCards = cards.filter(c => !tableCards.includes(c.key));
  
  return (
    <div 
      className="relative h-full w-full flex items-end justify-center pb-4"
      data-testid="card-hand"
    >
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      
      <div className="relative w-full max-w-3xl h-44">
        {cards.map((item, index) => (
          <DraggableCard
            key={item.key}
            cardKey={item.key}
            card={item.card}
            index={index}
            total={cards.length}
            isOnTable={tableCards.includes(item.key)}
            onClick={() => onClickCard?.(item.key)}
          />
        ))}
      </div>
      
      {visibleCards.length < cards.length && (
        <div className="absolute bottom-2 left-4 text-xs text-muted-foreground">
          <span className="font-mono-game">{cards.length - visibleCards.length}</span> carta(s) na mesa
        </div>
      )}
    </div>
  );
}
