import type { Card, DeckType } from "@shared/schema";
import { DECK_INFO } from "@shared/cardData";
import { Card as UICard, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Lightbulb, BarChart3, ClipboardList, ShieldCheck, MessageSquare } from "lucide-react";

const DECK_ICONS: Record<DeckType, React.ReactNode> = {
  C: <Briefcase className="h-4 w-4" />,
  E: <Lightbulb className="h-4 w-4" />,
  F: <BarChart3 className="h-4 w-4" />,
  P: <ClipboardList className="h-4 w-4" />,
  G: <ShieldCheck className="h-4 w-4" />,
  S: <MessageSquare className="h-4 w-4" />,
};

const DECK_COLORS: Record<DeckType, string> = {
  C: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  E: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  F: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  P: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  G: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  S: "bg-primary/10 text-primary border-primary/20",
};

const DECK_ACCENT_BORDERS: Record<DeckType, string> = {
  C: "border-l-chart-1",
  E: "border-l-chart-2",
  F: "border-l-chart-3",
  P: "border-l-chart-4",
  G: "border-l-chart-5",
  S: "border-l-primary",
};

interface GameCardProps {
  card: Card;
  isActive?: boolean;
  isCompact?: boolean;
  onClick?: () => void;
}

export function GameCard({ card, isActive = false, isCompact = false, onClick }: GameCardProps) {
  const deckInfo = DECK_INFO[card.deckType];

  if (isCompact) {
    return (
      <UICard 
        className={`cursor-pointer transition-all hover-elevate active-elevate-2 ${
          isActive ? "ring-2 ring-primary" : ""
        }`}
        onClick={onClick}
        data-testid={`card-compact-${card.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-md ${DECK_COLORS[card.deckType]}`}>
              {DECK_ICONS[card.deckType]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
                  {card.id}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {deckInfo.name}
                </Badge>
              </div>
              <h4 className="font-semibold text-sm truncate">{card.name}</h4>
            </div>
          </div>
        </CardContent>
      </UICard>
    );
  }

  return (
    <UICard 
      className={`relative overflow-visible transition-all ${
        isActive ? "ring-2 ring-primary shadow-lg" : ""
      } ${onClick ? "cursor-pointer hover-elevate active-elevate-2" : ""}`}
      onClick={onClick}
      data-testid={`card-${card.id}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${DECK_ACCENT_BORDERS[card.deckType].replace("border-l-", "bg-")}`} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-md ${DECK_COLORS[card.deckType]}`}>
              {DECK_ICONS[card.deckType]}
            </div>
            <div>
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wide block mb-1">
                {card.id}
              </span>
              <h3 className="font-semibold text-lg leading-tight">{card.name}</h3>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {deckInfo.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Situação</h4>
          <p className="text-sm leading-relaxed">{card.situation}</p>
        </div>
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Desafio</h4>
          <p className="text-base font-medium leading-relaxed">{card.challenge}</p>
        </div>
      </CardContent>
    </UICard>
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
    <div
      className="relative cursor-pointer group"
      onClick={onClick}
      data-testid={`deck-stack-${deckType}`}
    >
      <div className="absolute inset-0 translate-x-1 translate-y-1">
        <UICard className="h-full opacity-60" />
      </div>
      <div className="absolute inset-0 translate-x-0.5 translate-y-0.5">
        <UICard className="h-full opacity-80" />
      </div>
      <UICard className="relative hover-elevate active-elevate-2 transition-all">
        <CardContent className="p-6 flex flex-col items-center justify-center aspect-[3/4] min-h-[200px]">
          <div className={`flex items-center justify-center w-16 h-16 rounded-lg mb-4 ${DECK_COLORS[deckType]}`}>
            {DECK_ICONS[deckType]}
          </div>
          <h3 className="font-semibold text-center mb-1">{deckInfo.name}</h3>
          <span className="font-mono text-sm text-muted-foreground">
            {count} cartas
          </span>
        </CardContent>
      </UICard>
    </div>
  );
}
