import { Check, Circle } from "lucide-react";

type GameStep = "cards" | "diagnosis" | "decision" | "execution" | "storytelling" | "complete";

interface StepInfo {
  key: GameStep;
  label: string;
  shortLabel: string;
}

const STEPS: StepInfo[] = [
  { key: "cards", label: "Cartas Sorteadas", shortLabel: "Cartas" },
  { key: "diagnosis", label: "Diagnóstico", shortLabel: "Diagnóstico" },
  { key: "decision", label: "Decisão", shortLabel: "Decisão" },
  { key: "execution", label: "Execução", shortLabel: "Execução" },
  { key: "storytelling", label: "Storytelling", shortLabel: "Story" },
];

interface GameStepIndicatorProps {
  currentStep: GameStep;
  onStepClick?: (step: GameStep) => void;
}

export function GameStepIndicator({ currentStep, onStepClick }: GameStepIndicatorProps) {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep);
  const isComplete = currentStep === "complete";

  return (
    <div className="flex items-center gap-1 md:gap-2" data-testid="step-indicator">
      {STEPS.map((step, index) => {
        const isCompleted = isComplete || index < currentIndex;
        const isCurrent = index === currentIndex && !isComplete;
        const isPending = index > currentIndex && !isComplete;

        return (
          <div key={step.key} className="flex items-center">
            <button
              className={`flex items-center gap-1.5 px-2 py-1.5 md:px-3 md:py-2 rounded-md transition-colors ${
                isCompleted
                  ? "bg-chart-5/10 text-chart-5"
                  : isCurrent
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground"
              } ${onStepClick && isCompleted ? "cursor-pointer hover-elevate" : ""}`}
              onClick={() => onStepClick && isCompleted && onStepClick(step.key)}
              disabled={!onStepClick || !isCompleted}
              data-testid={`step-${step.key}`}
            >
              <span className={`flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full text-xs font-medium ${
                isCompleted
                  ? "bg-chart-5 text-white"
                  : isCurrent
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
              </span>
              <span className="hidden md:inline text-sm">{step.label}</span>
              <span className="md:hidden text-xs">{step.shortLabel}</span>
            </button>
            {index < STEPS.length - 1 && (
              <div className={`w-4 md:w-8 h-0.5 mx-1 ${
                isCompleted ? "bg-chart-5" : "bg-muted"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
