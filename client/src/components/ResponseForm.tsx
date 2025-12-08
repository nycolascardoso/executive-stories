import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Sparkles, Lightbulb, Zap, Mic } from "lucide-react";
import type { DrawnCards } from "@shared/schema";
import { motion } from "framer-motion";
import { VoiceInput } from "./VoiceInput";

type GameStep = "cards" | "diagnosis" | "decision" | "execution" | "storytelling" | "complete";

interface ResponseFormProps {
  step: GameStep;
  cards: DrawnCards;
  initialValues?: Record<string, string>;
  onSubmit: (values: Record<string, string>) => void;
  onBack?: () => void;
  isSubmitting?: boolean;
}

interface StepConfig {
  title: string;
  description: string;
  fields: {
    key: string;
    label: string;
    placeholder: string;
    hint?: string;
  }[];
  tips?: string[];
}

function getStepConfig(step: GameStep, cards: DrawnCards): StepConfig | null {
  switch (step) {
    case "diagnosis":
      return {
        title: "Diagnóstico",
        description: "Analise o cenário e identifique os pontos críticos.",
        fields: [
          {
            key: "contextDescription",
            label: "Contexto e Problema Central",
            placeholder: "Descreva em 3 frases o contexto e o problema central que a empresa enfrenta...",
            hint: "Considere a situação da carta de Contexto e como ela se relaciona com os outros desafios.",
          },
          {
            key: "mainRisks",
            label: "Principais Riscos",
            placeholder: "Liste 3 riscos principais se nenhuma ação for tomada...",
            hint: "Pense nas consequências de curto, médio e longo prazo.",
          },
          {
            key: "opportunities",
            label: "Oportunidades",
            placeholder: "Identifique 3 oportunidades escondidas neste cenário...",
            hint: "Toda crise traz oportunidades - quais são elas aqui?",
          },
        ],
        tips: [
          "Conecte os elementos das diferentes cartas",
          "Seja específico e evite generalizações",
          "Priorize por impacto e probabilidade",
        ],
      };
    case "decision":
      return {
        title: "Decisão Estratégica",
        description: "Defina estratégias e indicadores financeiros.",
        fields: [
          {
            key: "strategicDecisions",
            label: "Decisões Estratégicas",
            placeholder: "Quais 3 decisões estratégicas você tomaria?...",
            hint: `Carta de Estratégia: ${cards.strategy.name}`,
          },
          {
            key: "financialIndicators",
            label: "Indicadores Financeiros",
            placeholder: "Quais 3 indicadores você acompanharia e por quê?...",
            hint: `Carta de Finanças: ${cards.finance.name}`,
          },
          {
            key: "scenarios",
            label: "Cenários",
            placeholder: "Descreva cenários pessimista, base e otimista...",
            hint: "2-3 frases para cada cenário, com premissas claras.",
          },
        ],
        tips: [
          "O que você cortaria primeiro?",
          "Onde investiria mesmo com pouco caixa?",
          "O que jamais cortaria?",
        ],
      };
    case "execution":
      return {
        title: "Plano de Execução",
        description: "Iniciativas concretas e mitigação de riscos.",
        fields: [
          {
            key: "initiatives",
            label: "Iniciativas e Projetos",
            placeholder: "Liste 3 iniciativas com: Nome, Dono, Horizonte de tempo...",
            hint: `Carta de Projetos: ${cards.project.name}`,
          },
          {
            key: "riskMitigation",
            label: "Riscos e Mitigação",
            placeholder: "Liste 3 riscos com: Risco, Ação de mitigação, Indicador de alerta...",
            hint: `Carta de Governança: ${cards.governance.name}`,
          },
        ],
        tips: [
          "Seja específico sobre o dono de cada iniciativa",
          "Defina indicadores claros para monitorar",
          "Considere dependências entre iniciativas",
        ],
      };
    case "storytelling":
      return {
        title: "Storytelling Executivo",
        description: `Apresentação para: ${cards.storytelling.name}`,
        fields: [
          {
            key: "presentation",
            label: "Sua Narrativa",
            placeholder: `Estruture em 5 partes:

1. CONTEXTO - Situação atual

2. TENSÃO - Desafio central

3. DECISÃO - Sua recomendação

4. PLANO - Como executar

5. PEDIDO - O que você precisa`,
            hint: cards.storytelling.challenge,
          },
        ],
        tips: [
          "Evite jargões, busque objetividade",
          "Equilibre ambição com credibilidade",
          "Adapte ao seu público-alvo",
        ],
      };
    default:
      return null;
  }
}

export function ResponseForm({
  step,
  cards,
  initialValues = {},
  onSubmit,
  onBack,
  isSubmitting = false,
}: ResponseFormProps) {
  const config = getStepConfig(step, cards);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    config?.fields.forEach(field => {
      initial[field.key] = initialValues[field.key] || "";
    });
    return initial;
  });
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);

  if (!config) return null;

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleVoiceTranscript = (key: string, transcript: string) => {
    setValues(prev => ({
      ...prev,
      [key]: prev[key] ? `${prev[key]}\n\n${transcript}` : transcript,
    }));
    setActiveVoiceField(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const isValid = config.fields.every(field => values[field.key]?.trim().length > 0);

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-6" 
      data-testid={`form-${step}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-semibold">{config.title}</h2>
        </div>
        <p className="text-muted-foreground ml-12">{config.description}</p>
      </div>

      {config.tips && config.tips.length > 0 && (
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Lightbulb className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm mb-2 text-emerald-400">Dicas</h4>
                <ul className="space-y-1">
                  {config.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {config.fields.map((field, index) => (
          <motion.div 
            key={field.key} 
            className="space-y-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
          >
            <label htmlFor={field.key} className="block">
              <span className="font-medium">{field.label}</span>
              {field.hint && (
                <span className="block text-sm text-muted-foreground mt-1">{field.hint}</span>
              )}
            </label>
            <Textarea
              id={field.key}
              value={values[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="min-h-32 resize-y bg-card/50 border-border/50 focus:border-primary/50 transition-colors"
              data-testid={`input-${field.key}`}
            />
            <div className="flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveVoiceField(activeVoiceField === field.key ? null : field.key)}
                className="text-xs"
                data-testid={`button-voice-${field.key}`}
              >
                <Mic className="h-3 w-3 mr-1.5" />
                {activeVoiceField === field.key ? "Cancelar Voz" : "Ditar"}
              </Button>
              <span className="font-mono-game text-[10px] text-muted-foreground/60">
                {values[field.key]?.length || 0} caracteres
              </span>
            </div>
            {activeVoiceField === field.key && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <VoiceInput
                  onTranscript={(text) => handleVoiceTranscript(field.key, text)}
                  disabled={isSubmitting}
                />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/30">
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={isSubmitting}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        ) : (
          <div />
        )}
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={step === "storytelling" ? "btn-game-primary text-primary-foreground" : ""}
          data-testid="button-next"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <motion.div 
                className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Processando...
            </span>
          ) : step === "storytelling" ? (
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Finalizar Rodada
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Próximo
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </motion.form>
  );
}
