import type { Card, DeckType } from "@shared/schema";
import { DECK_INFO } from "@shared/cardData";
import { Card as UICard, CardContent } from "@/components/ui/card";
import { Briefcase, Lightbulb, BarChart3, ClipboardList, ShieldCheck, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const DECK_ICONS: Record<DeckType, React.ReactNode> = {
  C: <Briefcase className="h-5 w-5" />,
  E: <Lightbulb className="h-5 w-5" />,
  F: <BarChart3 className="h-5 w-5" />,
  P: <ClipboardList className="h-5 w-5" />,
  G: <ShieldCheck className="h-5 w-5" />,
  S: <MessageSquare className="h-5 w-5" />,
};

const DECK_GLOW_CLASSES: Record<DeckType, string> = {
  C: "card-glow-context",
  E: "card-glow-strategy",
  F: "card-glow-finance",
  P: "card-glow-projects",
  G: "card-glow-governance",
  S: "card-glow-storytelling",
};

const DECK_ICON_COLORS: Record<DeckType, string> = {
  C: "text-amber-400",
  E: "text-emerald-400",
  F: "text-cyan-400",
  P: "text-blue-400",
  G: "text-purple-400",
  S: "text-pink-400",
};

const DECK_BG_COLORS: Record<DeckType, string> = {
  C: "bg-amber-500/10",
  E: "bg-emerald-500/10",
  F: "bg-cyan-500/10",
  P: "bg-blue-500/10",
  G: "bg-purple-500/10",
  S: "bg-pink-500/10",
};

interface GameCardProps {
  card: Card;
  isActive?: boolean;
  isCompact?: boolean;
  onClick?: () => void;
  index?: number;
}

export function GameCard({ card, isActive = false, isCompact = false, onClick, index = 0 }: GameCardProps) {
  const deckInfo = DECK_INFO[card.deckType];

  if (isCompact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <UICard 
          className={`cursor-pointer transition-all border-border/50 bg-card/80 ${
            isActive ? "ring-2 ring-primary" : ""
          } ${DECK_GLOW_CLASSES[card.deckType]}`}
          style={{ boxShadow: isActive ? undefined : 'none' }}
          onClick={onClick}
          data-testid={`card-compact-${card.id}`}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${DECK_BG_COLORS[card.deckType]}`}>
                <span className={DECK_ICON_COLORS[card.deckType]}>
                  {DECK_ICONS[card.deckType]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono-game text-[10px] text-muted-foreground uppercase tracking-widest">
                    {card.id}
                  </span>
                  <span className={`text-[10px] font-medium ${DECK_ICON_COLORS[card.deckType]}`}>
                    {deckInfo.name}
                  </span>
                </div>
                <h4 className="font-display font-semibold text-sm truncate">{card.name}</h4>
              </div>
            </div>
          </CardContent>
        </UICard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateY: -15 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.02, 
        y: -4,
        transition: { duration: 0.2 }
      }}
    >
      <UICard 
        className={`relative overflow-visible transition-all border-border/30 bg-card/90 backdrop-blur ${
          isActive ? "ring-2 ring-primary" : ""
        } ${onClick ? "cursor-pointer" : ""} ${DECK_GLOW_CLASSES[card.deckType]}`}
        onClick={onClick}
        data-testid={`card-${card.id}`}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${DECK_BG_COLORS[card.deckType]}`}>
              <span className={DECK_ICON_COLORS[card.deckType]}>
                {DECK_ICONS[card.deckType]}
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono-game text-[10px] text-muted-foreground uppercase tracking-widest block">
                {card.id}
              </span>
              <span className={`text-xs font-medium ${DECK_ICON_COLORS[card.deckType]}`}>
                {deckInfo.name}
              </span>
            </div>
          </div>

          <h3 className="font-display font-semibold text-lg mb-4 leading-tight">{card.name}</h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Situação
              </h4>
              <p className="text-sm leading-relaxed text-foreground/90">{card.situation}</p>
            </div>
            
            <div className="pt-3 border-t border-border/30">
              <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Desafio
              </h4>
              <p className="text-sm font-medium leading-relaxed">{card.challenge}</p>
            </div>
          </div>
        </CardContent>
      </UICard>
    </motion.div>
  );
}

interface DeckStackProps {
  deckType: DeckType;
  count?: number;
  onClick?: () => void;
}

export function DeckStack({ deckType, count = 10, onClick }: DeckStackProps) {
  const deckInfo = DECK_INFO[deckType];

  return (
    <motion.div
      className="relative cursor-pointer group"
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      data-testid={`deck-stack-${deckType}`}
    >
      <div className="absolute inset-0 translate-x-1.5 translate-y-1.5">
        <UICard className="h-full opacity-40 border-border/20" />
      </div>
      <div className="absolute inset-0 translate-x-0.5 translate-y-0.5">
        <UICard className="h-full opacity-60 border-border/30" />
      </div>
      <UICard className={`relative transition-all border-border/50 ${DECK_GLOW_CLASSES[deckType]}`}>
        <CardContent className="p-6 flex flex-col items-center justify-center aspect-[3/4] min-h-[200px]">
          <div className={`flex items-center justify-center w-14 h-14 rounded-xl mb-4 ${DECK_BG_COLORS[deckType]}`}>
            <span className={DECK_ICON_COLORS[deckType]}>
              {DECK_ICONS[deckType]}
            </span>
          </div>
          <h3 className="font-display font-semibold text-center mb-1">{deckInfo.name}</h3>
          <span className="font-mono-game text-xs text-muted-foreground">
            {count} cartas
          </span>
        </CardContent>
      </UICard>
    </motion.div>
  );
}
