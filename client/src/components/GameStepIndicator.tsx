import { Check } from "lucide-react";
import { motion } from "framer-motion";

type GameStep = "cards" | "diagnosis" | "decision" | "execution" | "storytelling" | "complete";

interface StepInfo {
  key: GameStep;
  label: string;
  shortLabel: string;
}

const STEPS: StepInfo[] = [
  { key: "cards", label: "Cartas", shortLabel: "1" },
  { key: "diagnosis", label: "Diagnóstico", shortLabel: "2" },
  { key: "decision", label: "Decisão", shortLabel: "3" },
  { key: "execution", label: "Execução", shortLabel: "4" },
  { key: "storytelling", label: "Storytelling", shortLabel: "5" },
];

interface GameStepIndicatorProps {
  currentStep: GameStep;
  onStepClick?: (step: GameStep) => void;
}

export function GameStepIndicator({ currentStep, onStepClick }: GameStepIndicatorProps) {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep);
  const isComplete = currentStep === "complete";

  return (
    <div className="flex items-center gap-1" data-testid="step-indicator">
      {STEPS.map((step, index) => {
        const isCompleted = isComplete || index < currentIndex;
        const isCurrent = index === currentIndex && !isComplete;

        return (
          <div key={step.key} className="flex items-center">
            <motion.button
              className={`flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-lg transition-colors ${
                isCompleted
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : isCurrent
                  ? "bg-primary/10 text-primary border border-primary/20 font-medium"
                  : "text-muted-foreground/50"
              } ${onStepClick && isCompleted ? "cursor-pointer" : "cursor-default"}`}
              onClick={() => onStepClick && isCompleted && onStepClick(step.key)}
              disabled={!onStepClick || !isCompleted}
              data-testid={`step-${step.key}`}
              whileHover={onStepClick && isCompleted ? { scale: 1.02 } : {}}
              whileTap={onStepClick && isCompleted ? { scale: 0.98 } : {}}
            >
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-mono-game font-medium ${
                isCompleted
                  ? "bg-emerald-500 text-white"
                  : isCurrent
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground/50"
              }`}>
                {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
              </span>
              <span className="hidden lg:inline text-xs">{step.label}</span>
            </motion.button>
            {index < STEPS.length - 1 && (
              <div className={`w-3 md:w-6 h-px mx-0.5 ${
                isCompleted ? "bg-emerald-500/50" : "bg-border/30"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
