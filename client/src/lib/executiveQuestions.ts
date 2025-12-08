import type { Card, DeckType } from "@shared/schema";

interface ExecutiveQuestion {
  executiveId: string;
  question: string;
  context?: string;
}

interface PlayerResponses {
  diagnostico: string;
  decisoes: string;
  execucao: string;
  storytelling: string;
}

const CEO_BASE_QUESTIONS: Record<DeckType, string[]> = {
  C: [
    "Como essa análise de contexto fortalece nossa tese de longo prazo?",
    "O que exatamente nos diferencia dos concorrentes nesse cenário?",
    "Qual é o risco real dessa situação e como você pretende mitigá-lo?",
  ],
  E: [
    "Como essa estratégia nos posiciona para o crescimento nos próximos 3 anos?",
    "O que impede que um concorrente copie isso em 6 meses?",
    "Quais são os trade-offs de curto prazo que estamos assumindo?",
  ],
  F: [
    "Como esses números suportam nossa visão estratégica de longo prazo?",
    "Qual é o impacto no valor da empresa se essa projeção falhar?",
    "Estamos sendo agressivos ou conservadores demais com essas estimativas?",
  ],
  P: [
    "Como esse projeto contribui para nossa vantagem competitiva sustentável?",
    "O que acontece com nossa estratégia se esse projeto atrasar 6 meses?",
    "Estamos investindo recursos suficientes ou subestimando a complexidade?",
  ],
  G: [
    "Como o mercado e os acionistas perceberão essa decisão?",
    "Quais são os cenários em que essa aposta dá errado?",
    "Estamos protegendo adequadamente os interesses de longo prazo da empresa?",
  ],
  S: [
    "Essa narrativa é convincente para todos os stakeholders?",
    "Como comunicamos isso sem gerar pânico ou falsas expectativas?",
    "A mensagem está alinhada com nossos valores e cultura?",
  ],
};

const CFO_BASE_QUESTIONS: Record<DeckType, string[]> = {
  C: [
    "Qual é o impacto financeiro real desse cenário que você descreveu?",
    "Temos reservas suficientes para absorver os riscos identificados?",
    "Como isso afeta nosso custo de capital?",
  ],
  E: [
    "Qual é o ROI esperado dessa estratégia?",
    "Por que investiríamos nisso se o retorno é menor que a taxa SELIC?",
    "Quanto tempo até vermos retorno financeiro tangível?",
  ],
  F: [
    "Mostre o impacto no fluxo de caixa dos próximos 12 meses.",
    "Se a receita demorar 6 meses a mais, onde você ajusta o orçamento?",
    "Quais são os gatilhos para reavaliar esse investimento?",
  ],
  P: [
    "Qual é o custo total desse projeto, incluindo custos ocultos?",
    "Como você justifica esse investimento versus alternativas mais baratas?",
    "Qual é o payback period e como se compara a outros projetos?",
  ],
  G: [
    "Quais são os custos de compliance e mitigação de riscos?",
    "Como isso impacta nossa classificação de risco e custo de dívida?",
    "Temos provisões adequadas para os cenários pessimistas?",
  ],
  S: [
    "Qual é o impacto financeiro de uma má comunicação?",
    "Precisamos de reservas para gestão de crise?",
    "Como medimos o ROI dessa iniciativa de comunicação?",
  ],
};

const COO_BASE_QUESTIONS: Record<DeckType, string[]> = {
  C: [
    "Qual é a capacidade operacional para lidar com esse cenário?",
    "Temos as pessoas certas para executar nesse contexto?",
    "O que precisa mudar operacionalmente nos próximos 90 dias?",
  ],
  E: [
    "Você está propondo isso com o mesmo time e mesmas horas. O que sai da fila?",
    "Temos capacidade operacional para executar essa estratégia?",
    "Quais processos precisam mudar para suportar essa direção?",
  ],
  F: [
    "Como os números afetam nossa capacidade de entrega?",
    "Temos recursos operacionais para os cenários projetados?",
    "Qual é o impacto nos custos operacionais?",
  ],
  P: [
    "Como você garante que isso não vai quebrar a operação nos próximos 90 dias?",
    "Quais dependências críticas você está subestimando?",
    "Temos bandwidth do time para mais esse projeto?",
  ],
  G: [
    "Quais controles operacionais precisam ser implementados?",
    "Como garantimos conformidade no dia a dia?",
    "Qual é o overhead operacional das medidas de governança?",
  ],
  S: [
    "Como a equipe será preparada para essa nova narrativa?",
    "Qual é o plano de comunicação interna antes do externo?",
    "Como medimos se a mensagem foi absorvida pela organização?",
  ],
};

const BOARD_BASE_QUESTIONS: Record<DeckType, string[]> = {
  C: [
    "Como os stakeholders externos perceberão nossa posição nesse contexto?",
    "Estamos cumprindo nosso dever fiduciário ao abordar isso assim?",
    "Quais são as implicações de longo prazo para o valor aos acionistas?",
  ],
  E: [
    "Essa estratégia está alinhada com os interesses dos acionistas?",
    "Quais são os cenários em que o conselho seria responsabilizado?",
    "Como isso se compara com o que nossos pares do mercado estão fazendo?",
  ],
  F: [
    "Os números são conservadores o suficiente para proteção dos acionistas?",
    "Qual é a exposição máxima de risco que estamos assumindo?",
    "Como isso afeta nossa política de dividendos e reinvestimento?",
  ],
  P: [
    "Esse projeto é material o suficiente para supervisão do conselho?",
    "Quais são os checkpoints onde o conselho deve ser consultado?",
    "Há conflitos de interesse que precisamos considerar?",
  ],
  G: [
    "Estamos atendendo às melhores práticas de governança do mercado?",
    "Há riscos reputacionais que precisamos antecipar?",
    "Como garantimos transparência adequada aos acionistas?",
  ],
  S: [
    "A comunicação atende aos requisitos de disclosure?",
    "Como protegemos a reputação da empresa e do conselho?",
    "Há riscos legais ou regulatórios nessa narrativa?",
  ],
};

const EXECUTIVE_QUESTION_BANKS: Record<string, Record<DeckType, string[]>> = {
  ceo: CEO_BASE_QUESTIONS,
  cfo: CFO_BASE_QUESTIONS,
  coo: COO_BASE_QUESTIONS,
  board: BOARD_BASE_QUESTIONS,
};

const CEO_CONTEXTUAL_TEMPLATES = [
  "Você mencionou '{excerpt}' no diagnóstico. Como isso se conecta com nossa visão de 5 anos?",
  "Sobre sua análise de '{excerpt}', qual é o diferencial competitivo real que temos aqui?",
  "Você identificou '{excerpt}' como crítico. O que acontece se ignorarmos isso por 6 meses?",
];

const CFO_CONTEXTUAL_TEMPLATES = [
  "Você propôs '{excerpt}'. Qual é o impacto no EBITDA do próximo trimestre?",
  "Considerando '{excerpt}', quanto de capital de giro adicional precisaremos?",
  "Se '{excerpt}' não der resultado, qual é o plano B financeiro?",
];

const COO_CONTEXTUAL_TEMPLATES = [
  "Para implementar '{excerpt}', quantas horas-time isso consome?",
  "Sobre '{excerpt}' - isso compete com quais outras prioridades operacionais?",
  "Como você mede o sucesso de '{excerpt}' nos primeiros 30 dias?",
];

const BOARD_CONTEXTUAL_TEMPLATES = [
  "Os acionistas minoritários aprovariam '{excerpt}'?",
  "Há precedentes de mercado para '{excerpt}'? Como outros boards reagiram?",
  "Qual é o risco reputacional se '{excerpt}' der errado publicamente?",
];

const CONTEXTUAL_TEMPLATES: Record<string, string[]> = {
  ceo: CEO_CONTEXTUAL_TEMPLATES,
  cfo: CFO_CONTEXTUAL_TEMPLATES,
  coo: COO_CONTEXTUAL_TEMPLATES,
  board: BOARD_CONTEXTUAL_TEMPLATES,
};

function extractKeyPhrases(text: string): string[] {
  if (!text || text.length < 10) return [];
  
  const sentences = text.split(/[.!?;]/).filter(s => s.trim().length > 15);
  const phrases: string[] = [];
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 20 && trimmed.length < 100) {
      phrases.push(trimmed);
    } else if (trimmed.length >= 100) {
      const words = trimmed.split(' ');
      const shortPhrase = words.slice(0, 8).join(' ');
      if (shortPhrase.length > 20) {
        phrases.push(shortPhrase + '...');
      }
    }
  }
  
  return phrases.slice(0, 3);
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateContextualQuestion(
  executiveId: string, 
  playerResponses: PlayerResponses
): ExecutiveQuestion | null {
  const templates = CONTEXTUAL_TEMPLATES[executiveId];
  if (!templates) return null;

  const allText = [
    playerResponses.diagnostico,
    playerResponses.decisoes,
    playerResponses.execucao,
    playerResponses.storytelling,
  ].join(' ');

  const phrases = extractKeyPhrases(allText);
  if (phrases.length === 0) return null;

  const phrase = getRandomItem(phrases);
  const template = getRandomItem(templates);
  const question = template.replace('{excerpt}', phrase);

  return {
    executiveId,
    question,
    context: phrase,
  };
}

function generateBaseQuestion(
  executiveId: string,
  card: Card
): ExecutiveQuestion {
  const questionBank = EXECUTIVE_QUESTION_BANKS[executiveId];
  const questions = questionBank?.[card.deckType] || ["Como você justifica essa decisão?"];
  
  return {
    executiveId,
    question: getRandomItem(questions),
  };
}

export function generateExecutiveQuestions(
  tableCards: { key: string; card: Card }[],
  playerResponses?: PlayerResponses,
  executiveIds: string[] = ["ceo", "cfo", "coo", "board"]
): ExecutiveQuestion[] {
  if (tableCards.length === 0) return [];

  const questions: ExecutiveQuestion[] = [];
  const numQuestionsToGenerate = Math.min(executiveIds.length, 2 + Math.floor(tableCards.length / 2));
  const shuffledExecutives = [...executiveIds].sort(() => Math.random() - 0.5);
  const shuffledCards = [...tableCards].sort(() => Math.random() - 0.5);

  const hasSubstantialResponse = playerResponses && (
    playerResponses.diagnostico.length > 50 ||
    playerResponses.decisoes.length > 50 ||
    playerResponses.execucao.length > 50 ||
    playerResponses.storytelling.length > 50
  );

  for (let i = 0; i < numQuestionsToGenerate; i++) {
    const executive = shuffledExecutives[i % shuffledExecutives.length];
    const card = shuffledCards[i % shuffledCards.length];
    
    const useContextual = hasSubstantialResponse && Math.random() > 0.4;
    
    if (useContextual && playerResponses) {
      const contextualQ = generateContextualQuestion(executive, playerResponses);
      if (contextualQ) {
        questions.push(contextualQ);
        continue;
      }
    }
    
    questions.push(generateBaseQuestion(executive, card.card));
  }

  return questions;
}

export function getExecutiveChallenge(executiveId: string, card: Card): string {
  const questionBank = EXECUTIVE_QUESTION_BANKS[executiveId];
  if (!questionBank || !questionBank[card.deckType]) {
    return "Como você justifica essa decisão?";
  }
  return getRandomItem(questionBank[card.deckType]);
}

export function getExecutiveInfo(executiveId: string): { name: string; title: string; focus: string } {
  const info: Record<string, { name: string; title: string; focus: string }> = {
    ceo: { name: "CEO", title: "Chief Executive Officer", focus: "Visão estratégica e diferenciação" },
    cfo: { name: "CFO", title: "Chief Financial Officer", focus: "Retorno financeiro e riscos" },
    coo: { name: "COO", title: "Chief Operating Officer", focus: "Execução e capacidade operacional" },
    board: { name: "Conselho", title: "Board of Directors", focus: "Governança e stakeholders" },
  };
  return info[executiveId] || { name: executiveId, title: "", focus: "" };
}
