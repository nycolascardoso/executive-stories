import OpenAI from "openai";
import type { RoundResponse, DrawnCards, RoundScore } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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
}

export async function evaluateResponseWithAI(
  response: RoundResponse,
  cards: DrawnCards
): Promise<RoundScore> {
  const prompt = buildEvaluationPrompt(response, cards);
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um avaliador especializado em treinamento executivo e tomada de decisões estratégicas. 
Sua tarefa é avaliar as respostas de um participante em um jogo de simulação de cenários empresariais.

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

    return {
      diagnosisClarity,
      financialCoherence,
      executionRobustness,
      storytellingQuality,
      total,
      feedback: summaryFeedback.trim(),
    };
  } catch (error) {
    console.error("AI evaluation failed, using fallback scoring:", error);
    return getFallbackScore(response);
  }
}

function buildEvaluationPrompt(response: RoundResponse, cards: DrawnCards): string {
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

  prompt += `## Avaliação Solicitada

Avalie as respostas considerando:
1. **diagnosisClarity** (0-3): Clareza na identificação do contexto, riscos e oportunidades. A análise é completa e bem fundamentada?
2. **financialCoherence** (0-3): Coerência entre decisões estratégicas e indicadores financeiros. Os cenários são realistas?
3. **executionRobustness** (0-3): Robustez do plano de execução. As iniciativas são acionáveis? A mitigação de riscos é adequada?
4. **storytellingQuality** (0-3): Qualidade da narrativa executiva. A apresentação é persuasiva e estruturada?

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
  }
}`;

  return prompt;
}

function getFallbackScore(response: RoundResponse): RoundScore {
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
    feedback = "Iniciante no cenário. Suas respostas estão no caminho certo, mas podem ser mais detalhadas e estruturadas. Tente ser mais específico em cada etapa e considere como os diferentes elementos do cenário se conectam.";
  } else if (total <= 8) {
    feedback = "Boa estrutura, precisa refinar decisões. Você demonstra compreensão do cenário e apresenta análises relevantes. Para avançar, aprofunde a conexão entre diagnóstico, decisões e plano de execução. Seu storytelling pode ser mais impactante.";
  } else {
    feedback = "Nível executivo / consultor bem estruturado. Excelente análise! Você demonstra visão estratégica, coerência financeira e capacidade de comunicar decisões de forma clara e persuasiva. Continue praticando para manter a excelência.";
  }

  return {
    diagnosisClarity,
    financialCoherence,
    executionRobustness,
    storytellingQuality,
    total,
    feedback,
  };
}
