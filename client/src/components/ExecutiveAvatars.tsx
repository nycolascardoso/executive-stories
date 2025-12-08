import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, TrendingUp, Settings, Users, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Executive {
  id: string;
  role: string;
  title: string;
  style: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  focus: string[];
}

const EXECUTIVES: Executive[] = [
  {
    id: "ceo",
    role: "CEO",
    title: "Chief Executive Officer",
    style: "Visionário e desafiador",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    icon: <User className="h-5 w-5" />,
    focus: ["Visão de longo prazo", "Crescimento", "Risco estratégico"],
  },
  {
    id: "cfo",
    role: "CFO",
    title: "Chief Financial Officer",
    style: "Analítico e conservador",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    icon: <TrendingUp className="h-5 w-5" />,
    focus: ["ROI", "Fluxo de caixa", "Risco financeiro"],
  },
  {
    id: "coo",
    role: "COO",
    title: "Chief Operating Officer",
    style: "Pragmático e direto",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    icon: <Settings className="h-5 w-5" />,
    focus: ["Execução", "Capacidade", "Prazos"],
  },
  {
    id: "board",
    role: "Conselho",
    title: "Conselho de Administração",
    style: "Estratégico e cético",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    icon: <Users className="h-5 w-5" />,
    focus: ["Governança", "Valor de longo prazo", "Stakeholders"],
  },
];

interface ExecutiveCardProps {
  executive: Executive;
  isActive: boolean;
  isSpeaking: boolean;
  currentQuestion?: string;
  onDismissQuestion: () => void;
}

function ExecutiveCard({ executive, isActive, isSpeaking, currentQuestion, onDismissQuestion }: ExecutiveCardProps) {
  return (
    <motion.div
      className={`relative flex flex-col items-center transition-all duration-300 ${
        isActive ? 'opacity-100' : 'opacity-50'
      }`}
      animate={{ 
        scale: isSpeaking ? 1.05 : 1,
        y: isSpeaking ? -5 : 0,
      }}
    >
      <motion.div
        className={`w-14 h-14 rounded-full ${executive.bgColor} border-2 ${
          isSpeaking ? `border-${executive.color.replace('text-', '')}` : 'border-border/30'
        } flex items-center justify-center relative`}
        animate={{
          boxShadow: isSpeaking ? `0 0 20px ${executive.color.includes('amber') ? 'rgba(245,158,11,0.3)' : executive.color.includes('cyan') ? 'rgba(6,182,212,0.3)' : executive.color.includes('emerald') ? 'rgba(16,185,129,0.3)' : 'rgba(168,85,247,0.3)'}` : 'none',
        }}
      >
        <span className={executive.color}>{executive.icon}</span>
        
        {isSpeaking && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <MessageCircle className="h-2.5 w-2.5 text-primary-foreground" />
          </motion.div>
        )}
      </motion.div>
      
      <div className="text-center mt-2">
        <span className={`text-xs font-semibold ${executive.color}`}>{executive.role}</span>
        <p className="text-[9px] text-muted-foreground/60 hidden lg:block">{executive.style}</p>
      </div>
      
      <AnimatePresence>
        {currentQuestion && (
          <motion.div
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
          >
            <Card className={`w-64 border-2 ${executive.bgColor} backdrop-blur-xl`}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs leading-relaxed">{currentQuestion}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5 shrink-0"
                    onClick={onDismissQuestion}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface ExecutiveAvatarsProps {
  isActive: boolean;
  speakingExecutive?: string;
  questions: Record<string, string>;
  onDismissQuestion: (executiveId: string) => void;
}

export function ExecutiveAvatars({ isActive, speakingExecutive, questions, onDismissQuestion }: ExecutiveAvatarsProps) {
  if (!isActive) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground/40">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">Modo Boss desativado</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full flex items-center justify-center gap-8 lg:gap-12 px-4"
      data-testid="executive-avatars"
    >
      {EXECUTIVES.map((executive) => (
        <ExecutiveCard
          key={executive.id}
          executive={executive}
          isActive={isActive}
          isSpeaking={speakingExecutive === executive.id}
          currentQuestion={questions[executive.id]}
          onDismissQuestion={() => onDismissQuestion(executive.id)}
        />
      ))}
    </div>
  );
}

export function BossModeToggle({ 
  isActive, 
  onToggle 
}: { 
  isActive: boolean; 
  onToggle: () => void;
}) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      className={isActive ? "bg-primary/90" : ""}
      data-testid="button-boss-mode-toggle"
    >
      <Users className="h-4 w-4 mr-2" />
      Boss Mode {isActive ? "ON" : "OFF"}
    </Button>
  );
}
