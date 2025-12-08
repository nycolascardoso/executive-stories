import OpenAI from "openai";
import type { RoundResponse, DrawnCards, RoundScore } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface ExecutiveFeedback {
  executiveId: string;
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
  methodology: string;
}

interface AIEvaluationResult {
  diagnosisClarity: number;
  financialCoherence: number;
  executionRobustness: number;
  storytellingQuality: number;
  feedback: string;
  detailedAnalysis: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
  executiveFeedback?: {
    ceo: { score: number; feedback: string };
    cfo: { score: number; feedback: string };
    coo: { score: number; feedback: string };
    board: { score: number; feedback: string };
  };
}

export interface EnhancedRoundScore extends RoundScore {
  executiveFeedback?: ExecutiveFeedback[];
  methodologyInsights?: string[];
}

export async function evaluateResponseWithAI(
  response: RoundResponse,
  cards: DrawnCards,
  bossResponses?: Record<string, string>
): Promise<EnhancedRoundScore> {
  const prompt = buildEvaluationPrompt(response, cards, bossResponses);
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um avaliador especializado em treinamento executivo baseado nas melhores práticas de Harvard Business School, MIT Sloan e Stanford GSB.

Sua avaliação segue frameworks reconhecidos:
- CEO (Visão Estratégica): Framework de Vantagem Competitiva de Michael Porter
- CFO (Análise Financeira): Princípios de Valuation e Decision Analysis
- COO (Execução Operacional): Lean Operations e OKRs
- Board (Governança): Princípios ESG e Stakeholder Theory

Avalie cada dimensão de 0 a 3 pontos:
- 0: Resposta ausente, irrelevante ou muito superficial
- 1: Resposta básica, demonstra compreensão mínima
- 2: Resposta boa, bem estruturada com análise relevante
- 3: Resposta excelente, nível executivo/consultor sênior

Seja rigoroso mas justo. Forneça feedback construtivo em português brasileiro.
Responda APENAS com JSON válido, sem markdown.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return getFallbackScore(response);
    }

    const evaluation: AIEvaluationResult = JSON.parse(content);
    
    const diagnosisClarity = Math.min(3, Math.max(0, Math.round(evaluation.diagnosisClarity)));
    const financialCoherence = Math.min(3, Math.max(0, Math.round(evaluation.financialCoherence)));
    const executionRobustness = Math.min(3, Math.max(0, Math.round(evaluation.executionRobustness)));
    const storytellingQuality = Math.min(3, Math.max(0, Math.round(evaluation.storytellingQuality)));
    const total = diagnosisClarity + financialCoherence + executionRobustness + storytellingQuality;

    let summaryFeedback = evaluation.feedback || "";
    
    if (evaluation.detailedAnalysis) {
      const { strengths, improvements, recommendations } = evaluation.detailedAnalysis;
      
      if (strengths && strengths.length > 0) {
        summaryFeedback += `\n\nPontos fortes: ${strengths.join("; ")}`;
      }
      if (improvements && improvements.length > 0) {
        summaryFeedback += `\n\nÁreas para melhoria: ${improvements.join("; ")}`;
      }
      if (recommendations && recommendations.length > 0) {
        summaryFeedback += `\n\nRecomendações: ${recommendations.join("; ")}`;
      }
    }

    const executiveFeedback: ExecutiveFeedback[] = [];
    
    if (evaluation.executiveFeedback) {
      const execData = [
        { id: "ceo", name: "CEO", methodology: "Framework de Porter - Vantagem Competitiva" },
        { id: "cfo", name: "CFO", methodology: "Análise DCF e Decision Trees" },
        { id: "coo", name: "COO", methodology: "Lean Operations e OKRs" },
        { id: "board", name: "Conselho", methodology: "ESG e Stakeholder Theory" },
      ];

      for (const exec of execData) {
        const fb = evaluation.executiveFeedback[exec.id as keyof typeof evaluation.executiveFeedback];
        if (fb) {
          executiveFeedback.push({
            executiveId: exec.id,
            name: exec.name,
            score: Math.min(3, Math.max(0, fb.score)),
            maxScore: 3,
            feedback: fb.feedback,
            methodology: exec.methodology,
          });
        }
      }
    }

    const methodologyInsights = generateMethodologyInsights(total, diagnosisClarity, financialCoherence, executionRobustness, storytellingQuality);

    return {
      diagnosisClarity,
      financialCoherence,
      executionRobustness,
      storytellingQuality,
      total,
      feedback: summaryFeedback.trim(),
      executiveFeedback: executiveFeedback.length > 0 ? executiveFeedback : undefined,
      methodologyInsights,
    };
  } catch (error) {
    console.error("AI evaluation failed, using fallback scoring:", error);
    return getFallbackScore(response);
  }
}

function generateMethodologyInsights(
  total: number,
  diagnosis: number,
  financial: number,
  execution: number,
  storytelling: number
): string[] {
  const insights: string[] = [];

  if (diagnosis >= 2) {
    insights.push("Seu diagnóstico demonstra pensamento sistêmico alinhado com o framework de análise de cenários de Harvard.");
  } else if (diagnosis === 1) {
    insights.push("Aprofunde o diagnóstico usando a técnica dos '5 Porquês' para identificar causas raiz.");
  }

  if (financial >= 2) {
    insights.push("Sua análise financeira reflete princípios sólidos de valuation e gestão de riscos.");
  } else if (financial === 1) {
    insights.push("Considere incorporar análise de sensibilidade (MIT Sloan) para fortalecer projeções.");
  }

  if (execution >= 2) {
    insights.push("Seu plano de execução demonstra clareza operacional consistente com metodologias ágeis.");
  } else if (execution === 1) {
    insights.push("Defina OKRs mais específicos e mensuráveis para cada iniciativa proposta.");
  }

  if (storytelling >= 2) {
    insights.push("Sua narrativa segue a estrutura de comunicação executiva recomendada por Stanford GSB.");
  } else if (storytelling === 1) {
    insights.push("Utilize a estrutura 'Situação-Complicação-Resolução' para narrativas mais impactantes.");
  }

  if (total >= 10) {
    insights.push("Performance de nível C-Suite. Continue refinando para alcançar excelência consistente.");
  } else if (total >= 6) {
    insights.push("Base sólida de gestão. Foque em integrar melhor as diferentes dimensões da análise.");
  }

  return insights;
}

function buildEvaluationPrompt(
  response: RoundResponse, 
  cards: DrawnCards,
  bossResponses?: Record<string, string>
): string {
  let prompt = `## Cenário do Jogo (Cartas Sorteadas)

**Contexto (${cards.context.id}): ${cards.context.name}**
Situação: ${cards.context.situation}
Desafio: ${cards.context.challenge}

**Estratégia (${cards.strategy.id}): ${cards.strategy.name}**
Situação: ${cards.strategy.situation}
Desafio: ${cards.strategy.challenge}

**Finanças (${cards.finance.id}): ${cards.finance.name}**
Situação: ${cards.finance.situation}
Desafio: ${cards.finance.challenge}

**Projeto (${cards.project.id}): ${cards.project.name}**
Situação: ${cards.project.situation}
Desafio: ${cards.project.challenge}

**Governança (${cards.governance.id}): ${cards.governance.name}**
Situação: ${cards.governance.situation}
Desafio: ${cards.governance.challenge}

**Storytelling (${cards.storytelling.id}): ${cards.storytelling.name}**
Situação: ${cards.storytelling.situation}
Desafio: ${cards.storytelling.challenge}

## Respostas do Participante

`;

  if (response.diagnosis) {
    prompt += `### Etapa 1: Diagnóstico
- Descrição do contexto: ${response.diagnosis.contextDescription || "(não respondido)"}
- Principais riscos: ${response.diagnosis.mainRisks || "(não respondido)"}
- Oportunidades: ${response.diagnosis.opportunities || "(não respondido)"}

`;
  }

  if (response.decision) {
    prompt += `### Etapa 2: Decisão Estratégica
- Decisões estratégicas: ${response.decision.strategicDecisions || "(não respondido)"}
- Indicadores financeiros: ${response.decision.financialIndicators || "(não respondido)"}
- Cenários: ${response.decision.scenarios || "(não respondido)"}

`;
  }

  if (response.execution) {
    prompt += `### Etapa 3: Plano de Execução
- Iniciativas: ${response.execution.initiatives || "(não respondido)"}
- Mitigação de riscos: ${response.execution.riskMitigation || "(não respondido)"}

`;
  }

  if (response.storytelling) {
    prompt += `### Etapa 4: Storytelling
- Apresentação: ${response.storytelling.presentation || "(não respondido)"}

`;
  }

  if (bossResponses && Object.keys(bossResponses).length > 0) {
    prompt += `### Respostas às Perguntas dos Executivos (Boss Mode)
`;
    for (const [execId, response] of Object.entries(bossResponses)) {
      const execName = execId === 'ceo' ? 'CEO' : execId === 'cfo' ? 'CFO' : execId === 'coo' ? 'COO' : 'Conselho';
      prompt += `- Resposta ao ${execName}: ${response}
`;
    }
    prompt += `
`;
  }

  prompt += `## Avaliação Solicitada

Avalie as respostas considerando frameworks acadêmicos de referência:

1. **diagnosisClarity** (0-3): Clareza na identificação do contexto, riscos e oportunidades usando análise sistêmica.
2. **financialCoherence** (0-3): Coerência entre decisões e indicadores, usando princípios de valuation.
3. **executionRobustness** (0-3): Robustez do plano de execução com OKRs claros e acionáveis.
4. **storytellingQuality** (0-3): Qualidade da narrativa usando estrutura Situação-Complicação-Resolução.

Responda em JSON com este formato exato:
{
  "diagnosisClarity": <0-3>,
  "financialCoherence": <0-3>,
  "executionRobustness": <0-3>,
  "storytellingQuality": <0-3>,
  "feedback": "<feedback geral em português, 2-3 frases>",
  "detailedAnalysis": {
    "strengths": ["<ponto forte 1>", "<ponto forte 2>"],
    "improvements": ["<área para melhoria 1>", "<área para melhoria 2>"],
    "recommendations": ["<recomendação 1>", "<recomendação 2>"]
  },
  "executiveFeedback": {
    "ceo": { "score": <0-3>, "feedback": "<feedback do CEO sobre visão estratégica>" },
    "cfo": { "score": <0-3>, "feedback": "<feedback do CFO sobre aspectos financeiros>" },
    "coo": { "score": <0-3>, "feedback": "<feedback do COO sobre execução operacional>" },
    "board": { "score": <0-3>, "feedback": "<feedback do Conselho sobre governança e stakeholders>" }
  }
}`;

  return prompt;
}

function getFallbackScore(response: RoundResponse): EnhancedRoundScore {
  let diagnosisClarity = 0;
  let financialCoherence = 0;
  let executionRobustness = 0;
  let storytellingQuality = 0;

  if (response.diagnosis) {
    const d = response.diagnosis;
    if (d.contextDescription && d.contextDescription.length > 50) diagnosisClarity++;
    if (d.contextDescription && d.contextDescription.length > 150) diagnosisClarity++;
    if (d.mainRisks && d.mainRisks.length > 50) diagnosisClarity++;
    diagnosisClarity = Math.min(diagnosisClarity, 3);
  }

  if (response.decision) {
    const d = response.decision;
    if (d.strategicDecisions && d.strategicDecisions.length > 50) financialCoherence++;
    if (d.financialIndicators && d.financialIndicators.length > 50) financialCoherence++;
    if (d.scenarios && d.scenarios.length > 100) financialCoherence++;
    financialCoherence = Math.min(financialCoherence, 3);
  }

  if (response.execution) {
    const e = response.execution;
    if (e.initiatives && e.initiatives.length > 100) executionRobustness++;
    if (e.initiatives && e.initiatives.length > 200) executionRobustness++;
    if (e.riskMitigation && e.riskMitigation.length > 100) executionRobustness++;
    executionRobustness = Math.min(executionRobustness, 3);
  }

  if (response.storytelling) {
    const s = response.storytelling;
    if (s.presentation && s.presentation.length > 100) storytellingQuality++;
    if (s.presentation && s.presentation.length > 300) storytellingQuality++;
    if (s.presentation && s.presentation.length > 500) storytellingQuality++;
    storytellingQuality = Math.min(storytellingQuality, 3);
  }

  const total = diagnosisClarity + financialCoherence + executionRobustness + storytellingQuality;

  let feedback = "";
  if (total <= 4) {
    feedback = "Iniciante no cenário. Suas respostas estão no caminho certo, mas podem ser mais detalhadas e estruturadas.";
  } else if (total <= 8) {
    feedback = "Boa estrutura. Você demonstra compreensão do cenário. Aprofunde a conexão entre diagnóstico e execução.";
  } else {
    feedback = "Nível executivo. Excelente análise com visão estratégica e capacidade de comunicar decisões de forma clara.";
  }

  const executiveFeedback: ExecutiveFeedback[] = [
    {
      executiveId: "ceo",
      name: "CEO",
      score: diagnosisClarity,
      maxScore: 3,
      feedback: diagnosisClarity >= 2 ? "Visão estratégica sólida." : "Precisa desenvolver mais a visão de longo prazo.",
      methodology: "Framework de Porter",
    },
    {
      executiveId: "cfo",
      name: "CFO",
      score: financialCoherence,
      maxScore: 3,
      feedback: financialCoherence >= 2 ? "Análise financeira coerente." : "Fortaleça os indicadores financeiros.",
      methodology: "Análise DCF",
    },
    {
      executiveId: "coo",
      name: "COO",
      score: executionRobustness,
      maxScore: 3,
      feedback: executionRobustness >= 2 ? "Plano executável e claro." : "Defina iniciativas mais específicas.",
      methodology: "OKRs e Lean",
    },
    {
      executiveId: "board",
      name: "Conselho",
      score: storytellingQuality,
      maxScore: 3,
      feedback: storytellingQuality >= 2 ? "Comunicação adequada para stakeholders." : "Trabalhe a narrativa para o board.",
      methodology: "Stakeholder Theory",
    },
  ];

  return {
    diagnosisClarity,
    financialCoherence,
    executionRobustness,
    storytellingQuality,
    total,
    feedback,
    executiveFeedback,
    methodologyInsights: generateMethodologyInsights(total, diagnosisClarity, financialCoherence, executionRobustness, storytellingQuality),
  };
}
