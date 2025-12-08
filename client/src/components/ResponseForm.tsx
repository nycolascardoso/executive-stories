import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Save, Lightbulb } from "lucide-react";
import type { DrawnCards } from "@shared/schema";

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
        title: "Diagnóstico Estruturado",
        description: "Analise o cenário e identifique os pontos críticos da situação.",
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
            label: "Oportunidades Embutidas",
            placeholder: "Identifique 3 oportunidades escondidas neste cenário...",
            hint: "Toda crise traz oportunidades - quais são elas aqui?",
          },
        ],
        tips: [
          "Conecte os elementos das diferentes cartas para ter uma visão holística",
          "Seja específico e evite generalizações",
          "Priorize os riscos por impacto e probabilidade",
        ],
      };
    case "decision":
      return {
        title: "Decisão Financeira & Estratégica",
        description: "Defina as decisões estratégicas e os indicadores que você acompanhará.",
        fields: [
          {
            key: "strategicDecisions",
            label: "Decisões Estratégicas",
            placeholder: "Quais 3 decisões estratégicas você tomaria?...",
            hint: `Considere a carta de Estratégia: ${cards.strategy.name}`,
          },
          {
            key: "financialIndicators",
            label: "Indicadores Financeiros",
            placeholder: "Quais 3 indicadores financeiros você acompanharia de perto e por quê?...",
            hint: `Considere a carta de Finanças: ${cards.finance.name}`,
          },
          {
            key: "scenarios",
            label: "Cenários Financeiros",
            placeholder: "Descreva brevemente os cenários pessimista, base e otimista...",
            hint: "2-3 frases para cada cenário, com premissas claras.",
          },
        ],
        tips: [
          "O que você cortaria primeiro?",
          "Onde você investiria mesmo com pouco caixa?",
          "O que jamais cortaria para não matar o futuro do negócio?",
        ],
      };
    case "execution":
      return {
        title: "Plano de Execução",
        description: "Defina iniciativas concretas e estratégias de mitigação de riscos.",
        fields: [
          {
            key: "initiatives",
            label: "Iniciativas e Projetos",
            placeholder: "Liste 3 iniciativas/projetos concretos com: Nome, Dono (área/papel), Horizonte de tempo (curto, médio, longo)...",
            hint: `Considere a carta de Projetos: ${cards.project.name}`,
          },
          {
            key: "riskMitigation",
            label: "Riscos e Mitigação",
            placeholder: "Liste 3 riscos críticos com: Risco, Ação de mitigação, Indicador de que o risco está se materializando...",
            hint: `Considere a carta de Governança: ${cards.governance.name}`,
          },
        ],
        tips: [
          "Seja específico sobre quem é o dono de cada iniciativa",
          "Defina indicadores claros para monitorar riscos",
          "Considere dependências entre as iniciativas",
        ],
      };
    case "storytelling":
      return {
        title: "Storytelling Executivo",
        description: `Prepare sua apresentação de 2-3 minutos para: ${cards.storytelling.name}`,
        fields: [
          {
            key: "presentation",
            label: "Sua Apresentação",
            placeholder: `Estruture sua narrativa em 5 partes:

1. CONTEXTO
[Descreva a situação atual]

2. PROBLEMA / TENSÃO
[Qual é o desafio central?]

3. DECISÃO / TESE
[Qual sua recomendação?]

4. PLANO
[Como você vai executar?]

5. PRÓXIMOS PASSOS E PEDIDO
[O que você precisa do público?]`,
            hint: cards.storytelling.challenge,
          },
        ],
        tips: [
          "Evite jargões vazios e busque objetividade executiva",
          "Equilibre ambição com credibilidade",
          "Adapte a mensagem ao seu público-alvo",
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

  if (!config) return null;

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const isValid = config.fields.every(field => values[field.key]?.trim().length > 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid={`form-${step}`}>
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">{config.title}</h2>
        <p className="text-muted-foreground">{config.description}</p>
      </div>

      {config.tips && config.tips.length > 0 && (
        <Card className="bg-chart-2/5 border-chart-2/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Lightbulb className="h-5 w-5 text-chart-2 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm mb-2">Perguntas para reflexão:</h4>
                <ul className="space-y-1">
                  {config.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
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
        {config.fields.map(field => (
          <div key={field.key} className="space-y-2">
            <label htmlFor={field.key} className="block font-medium">
              {field.label}
            </label>
            {field.hint && (
              <p className="text-sm text-muted-foreground">{field.hint}</p>
            )}
            <Textarea
              id={field.key}
              value={values[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="min-h-32 resize-y"
              data-testid={`input-${field.key}`}
            />
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground">
                {values[field.key]?.length || 0} caracteres
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 pt-4 border-t">
        {onBack ? (
          <Button
            type="button"
            variant="outline"
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
          data-testid="button-next"
        >
          {step === "storytelling" ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Finalizar Rodada
            </>
          ) : (
            <>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
