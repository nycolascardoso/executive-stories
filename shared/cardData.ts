import type { Card, DeckType } from "./schema";

interface DeckInfo {
  type: DeckType;
  name: string;
  nameEn: string;
  color: string;
  icon: string;
}

export const DECK_INFO: Record<DeckType, DeckInfo> = {
  C: { type: "C", name: "Contexto & Empresa", nameEn: "Context", color: "chart-1", icon: "Briefcase" },
  E: { type: "E", name: "Estratégia", nameEn: "Strategy", color: "chart-2", icon: "Lightbulb" },
  F: { type: "F", name: "Finanças & Métricas", nameEn: "Finance", color: "chart-3", icon: "BarChart3" },
  P: { type: "P", name: "Projetos & Execução", nameEn: "Projects", color: "chart-4", icon: "ClipboardList" },
  G: { type: "G", name: "Governança & Risco", nameEn: "Governance", color: "chart-5", icon: "ShieldCheck" },
  S: { type: "S", name: "Storytelling & Comunicação", nameEn: "Storytelling", color: "primary", icon: "MessageSquare" },
};

export const ALL_CARDS: Card[] = [
  // Baralho C – Contexto & Empresa
  {
    id: "C1",
    deckType: "C",
    name: "Startup SaaS em Crescimento",
    situation: "Empresa B2B SaaS, receita recorrente, alta velocidade de aquisição de clientes, pouca estrutura interna.",
    challenge: "Como equilibrar crescimento agressivo com construção de processos e controles mínimos?"
  },
  {
    id: "C2",
    deckType: "C",
    name: "Indústria Tradicional Endividada",
    situation: "Fábrica antiga, margens pressionadas, alto nível de dívida, baixa inovação.",
    challenge: "Como restaurar competitividade e reduzir alavancagem sem matar o fluxo de caixa?"
  },
  {
    id: "C3",
    deckType: "C",
    name: "Varejo Físico em Declínio",
    situation: "Rede de lojas físicas perdendo vendas para e-commerce e players digitais.",
    challenge: "O que fazer para reposicionar o negócio e evitar um lento colapso?"
  },
  {
    id: "C4",
    deckType: "C",
    name: "Marketplace em Consolidação",
    situation: "Marketplace com boa base de vendedores, mas com baixa diferenciação frente aos gigantes do setor.",
    challenge: "Como encontrar uma tese clara de diferenciação e caminho para rentabilidade?"
  },
  {
    id: "C5",
    deckType: "C",
    name: "Prestador de Serviços B2B",
    situation: "Consultoria/serviços com poucos grandes clientes, forte dependência de relacionamento.",
    challenge: "Como reduzir risco de concentração e criar oferta escalável?"
  },
  {
    id: "C6",
    deckType: "C",
    name: "Negócio Familiar em Sucessão",
    situation: "Empresa de médio porte, controle familiar, próxima geração assumindo, conflitos velados.",
    challenge: "Como estruturar sucessão, profissionalização e governança sem romper relações?"
  },
  {
    id: "C7",
    deckType: "C",
    name: "Empresa de Mídia & Publicidade",
    situation: "Receitas fragmentadas, mídia tradicional perdendo valor, digital crescendo, dados mal aproveitados.",
    challenge: "Como transformar audiência em negócio recorrente e aumentar rentabilidade?"
  },
  {
    id: "C8",
    deckType: "C",
    name: "Healthtech Regulada",
    situation: "Solução tecnológica em saúde, regulação pesada, ciclos de venda longos, stakeholders complexos.",
    challenge: "Como crescer respeitando regulação e ainda assim acelerar receita?"
  },
  {
    id: "C9",
    deckType: "C",
    name: "Negócio Intensivo em CAPEX",
    situation: "Infraestrutura, logística ou energia, com investimentos altos e payback longo.",
    challenge: "Como aprovar projetos, gerenciar risco e garantir retorno aceitável?"
  },
  {
    id: "C10",
    deckType: "C",
    name: "Negócio de Assinatura Recorrente",
    situation: "Modelo de assinatura (B2C ou B2B), churn moderado, base relevante, pressão por crescimento.",
    challenge: "Como aumentar LTV, reduzir churn e encontrar novos upsells?"
  },

  // Baralho E – Estratégia
  {
    id: "E1",
    deckType: "E",
    name: "Crescimento a Qualquer Custo",
    situation: "Pressão de investidores/diretoria por crescimento acelerado, lucro pode esperar.",
    challenge: "Qual o limite saudável de queima de caixa e que trade-offs devem ser explicitados?"
  },
  {
    id: "E2",
    deckType: "E",
    name: "Foco em Lucratividade",
    situation: "A ordem é aumentar margem e fluxo de caixa, mesmo sacrificando crescimento.",
    challenge: "Onde cortar ou otimizar sem destruir o futuro da empresa?"
  },
  {
    id: "E3",
    deckType: "E",
    name: "Diferenciação por Produto",
    situation: "A aposta é ter o melhor produto/tecnologia, mesmo que isso custe mais caro.",
    challenge: "Como comunicar e precificar essa diferenciação de forma convincente?"
  },
  {
    id: "E4",
    deckType: "E",
    name: "Diferenciação por Serviço",
    situation: "Atendimento, suporte, implementação e relacionamento como grande diferencial.",
    challenge: "Como transformar serviço em vantagem econômica real, não apenas discurso?"
  },
  {
    id: "E5",
    deckType: "E",
    name: "Estratégia de Baixo Custo",
    situation: "Competir por eficiência operacional e preço agressivo.",
    challenge: "Onde ganhar escala, padronizar e reduzir complexidade sem comprometer qualidade mínima?"
  },
  {
    id: "E6",
    deckType: "E",
    name: "Estratégia de Nicho",
    situation: "Atuar em um segmento muito específico, com necessidades particulares.",
    challenge: "Que segmentação clara, proposta de valor e barreiras de entrada podem ser criadas?"
  },
  {
    id: "E7",
    deckType: "E",
    name: "Internacionalização",
    situation: "Mercado local saturado, oportunidade em outros países.",
    challenge: "Por onde começar (país, canal, produto) e quais riscos estratégicos precisam ser mapeados?"
  },
  {
    id: "E8",
    deckType: "E",
    name: "Diversificação de Portfólio",
    situation: "Adicionar novas linhas de produto/serviço para reduzir dependência atual.",
    challenge: "Como garantir foco e disciplina de capital nessa diversificação?"
  },
  {
    id: "E9",
    deckType: "E",
    name: "Desinvestimento / Venda de Unidade",
    situation: "Uma unidade de negócio destrói valor ou foge do core.",
    challenge: "Como estruturar a saída de forma financeiramente inteligente e politicamente viável?"
  },
  {
    id: "E10",
    deckType: "E",
    name: "Parcerias Estratégicas / Joint Venture",
    situation: "Sozinho é difícil crescer; parceria pode destravar canal, tecnologia ou capital.",
    challenge: "Que tipo de parceria faz sentido e como evitar perda de controle?"
  },

  // Baralho F – Finanças & Métricas
  {
    id: "F1",
    deckType: "F",
    name: "Queda Repentina de Receita",
    situation: "Receita cai 20–30% em poucos meses, sem tempo de adaptação.",
    challenge: "Quais linhas analisar primeiro e quais alavancas de curto prazo acionar?"
  },
  {
    id: "F2",
    deckType: "F",
    name: "Margem Bruta Comprimida",
    situation: "Custo de insumos ou descontos pressionam margem bruta.",
    challenge: "Onde atuar: preço, mix, repasse, renegociação ou eficiência operacional?"
  },
  {
    id: "F3",
    deckType: "F",
    name: "CAC Explodindo",
    situation: "Custo de aquisição de clientes aumenta muito, payback alonga.",
    challenge: "Como revisar canais, funil e proposta de valor para recuperar eficiência?"
  },
  {
    id: "F4",
    deckType: "F",
    name: "Churn e Retenção em Jogo",
    situation: "Clientes saindo mais rápido do que o esperado ou renovando menos.",
    challenge: "Que métricas e ações focar para fortalecer retenção e expansão de base?"
  },
  {
    id: "F5",
    deckType: "F",
    name: "Alavancagem Alta (Dívida/EBITDA > 3x)",
    situation: "Estrutura de capital arriscada, banco mais rígido, covenants próximos do limite.",
    challenge: "Quais opções de desalavancagem ou renegociação existem?"
  },
  {
    id: "F6",
    deckType: "F",
    name: "Stress de Caixa (Runway < 12 Meses)",
    situation: "Caixa cobre menos de 12 meses de operação, sem mudanças.",
    challenge: "Que plano de ação imediato pode estender runway com mínimo de destruição de valor?"
  },
  {
    id: "F7",
    deckType: "F",
    name: "Capex Alto com Retorno Incerto",
    situation: "Projeto grande, necessário, mas com ROI nebuloso.",
    challenge: "Que análise de cenários, estágios ou pilotos podem reduzir risco?"
  },
  {
    id: "F8",
    deckType: "F",
    name: "Pressão por Dividendos",
    situation: "Sócios/acionistas exigem distribuição maior, mesmo com necessidade de reinvestimento.",
    challenge: "Qual política de dividendos equilibrada você proporia?"
  },
  {
    id: "F9",
    deckType: "F",
    name: "Reprecificação de Produtos",
    situation: "Estrutura de preços desatualizada, inferior ao valor entregue ou desalinhada ao mercado.",
    challenge: "Como conduzir uma reprecificação sem perda massiva de clientes?"
  },
  {
    id: "F10",
    deckType: "F",
    name: "Rodada de Investimento em Risco",
    situation: "Investidores pensam em não seguir, valuation questionado.",
    challenge: "Que história financeira e estratégica sustenta uma nova rodada?"
  },

  // Baralho P – Projetos & Execução
  {
    id: "P1",
    deckType: "P",
    name: "Projeto Crítico Atrasado",
    situation: "Projeto chave para estratégia, mas consistentemente atrasado.",
    challenge: "O que priorizar: escopo, prazo, recursos ou qualidade?"
  },
  {
    id: "P2",
    deckType: "P",
    name: "Scope Creep (Escopo Inflado)",
    situation: "Stakeholders adicionam demandas continuamente ao projeto.",
    challenge: "Como reencadrar o escopo e renegociar expectativas?"
  },
  {
    id: "P3",
    deckType: "P",
    name: "Time Reduzido por Cortes",
    situation: "Equipe encolheu, mas entregas continuam as mesmas.",
    challenge: "Que decisões de priorização e sequenciamento precisa tomar?"
  },
  {
    id: "P4",
    deckType: "P",
    name: "Dependência de Fornecedor Único",
    situation: "Projeto depende de um único parceiro crítico.",
    challenge: "Como mitigar esse risco e estruturar plano B?"
  },
  {
    id: "P5",
    deckType: "P",
    name: "Mudança de Prioridade da Diretoria",
    situation: "A alta liderança muda de foco no meio do projeto.",
    challenge: "Como reavaliar portfólio de projetos e comunicar decisões?"
  },
  {
    id: "P6",
    deckType: "P",
    name: "Implementação de ERP / Sistema Central",
    situation: "Projeto pesado de sistema, impacto em operações, muita resistência.",
    challenge: "Como balancear urgência de implantação com risco operacional?"
  },
  {
    id: "P7",
    deckType: "P",
    name: "Migração de Dados Problemática",
    situation: "Dados incompletos, duplicados ou inconsistentes atrapalham projeto.",
    challenge: "Que abordagem para saneamento e governança de dados propor?"
  },
  {
    id: "P8",
    deckType: "P",
    name: "Projeto de Inovação sem Dono Claro",
    situation: "Iniciativa 'importante' mas sem sponsor efetivo.",
    challenge: "Como definir dono, critérios de sucesso e kill criteria?"
  },
  {
    id: "P9",
    deckType: "P",
    name: "Ausência de PMO Estruturado",
    situation: "Vários projetos críticos sem coordenação central.",
    challenge: "Como propor um modelo mínimo de governança de projetos?"
  },
  {
    id: "P10",
    deckType: "P",
    name: "Projeto Regulatório com Prazo Rígido",
    situation: "Regulação exige implementação até data específica, sem prorrogação.",
    challenge: "Como priorizar recursos e gerir riscos de não conformidade?"
  },

  // Baralho G – Governança & Risco
  {
    id: "G1",
    deckType: "G",
    name: "Falha de Compliance",
    situation: "Descoberta violação relevante (fiscal, trabalhista, LGPD etc.).",
    challenge: "Como reagir, comunicar e corrigir sem destruir reputação?"
  },
  {
    id: "G2",
    deckType: "G",
    name: "Auditoria Encontra Inconsistências",
    situation: "Auditoria identifica problemas em registros, controles ou estimativas.",
    challenge: "Que plano de correção e transparência apresentar?"
  },
  {
    id: "G3",
    deckType: "G",
    name: "Conflito Entre Sócios",
    situation: "Sócios com agendas diferentes sobre o futuro da empresa.",
    challenge: "Como estruturar uma decisão racional e minimizar destruição de valor?"
  },
  {
    id: "G4",
    deckType: "G",
    name: "Conselho Pressiona Curto Prazo",
    situation: "Conselho quer resultado imediato, mesmo à custa da tese de longo prazo.",
    challenge: "Como defender investimentos de longo prazo com narrativa e dados?"
  },
  {
    id: "G5",
    deckType: "G",
    name: "Pressão Sindical / Clima Interno Ruim",
    situation: "Greves, insatisfação, alta rotatividade.",
    challenge: "Como endereçar causas profundas e não apenas apagar incêndios?"
  },
  {
    id: "G6",
    deckType: "G",
    name: "Crise de Imagem em Redes Sociais",
    situation: "Crítica viral, boicote, narrativa negativa se espalhando.",
    challenge: "Que posicionamento e ações concretas tomar?"
  },
  {
    id: "G7",
    deckType: "G",
    name: "Mudança Regulatória Adversa",
    situation: "Nova lei ou regra reduz margem ou inviabiliza parte do negócio.",
    challenge: "Como redesenhar o modelo e defender competitividade?"
  },
  {
    id: "G8",
    deckType: "G",
    name: "Cliente Âncora Ameaça Sair",
    situation: "Principal cliente cogita trocar de fornecedor.",
    challenge: "Qual abordagem estratégica e comercial adotar?"
  },
  {
    id: "G9",
    deckType: "G",
    name: "Líder-Chave Deixa a Empresa",
    situation: "Saída repentina de executivo crítico.",
    challenge: "Como garantir continuidade e redesenhar liderança?"
  },
  {
    id: "G10",
    deckType: "G",
    name: "Cultura Tóxica em Área Crítica",
    situation: "Área chave com clima ruim, sabotagem e baixa colaboração.",
    challenge: "Que ações de cultura, liderança e estrutura são necessárias?"
  },

  // Baralho S – Storytelling & Comunicação
  {
    id: "S1",
    deckType: "S",
    name: "Pitch para Investidores",
    situation: "Você precisa defender tese, números e futuro do negócio para potenciais investidores.",
    challenge: "Como estruturar uma narrativa que equilibre ambição e credibilidade?"
  },
  {
    id: "S2",
    deckType: "S",
    name: "Apresentação para Conselho",
    situation: "Reunião de conselho com decisões críticas em pauta.",
    challenge: "Quais mensagens-chave, riscos e alternativas devem aparecer nos primeiros 5 minutos?"
  },
  {
    id: "S3",
    deckType: "S",
    name: "Reunião de Alinhamento com Diretoria",
    situation: "Diretoria desalinhada sobre prioridades e projetos.",
    challenge: "Como usar narrativa para criar visão comum e foco?"
  },
  {
    id: "S4",
    deckType: "S",
    name: "Townhall com Toda a Empresa",
    situation: "Precisa comunicar mudanças importantes para todos os colaboradores.",
    challenge: "Como gerar clareza, senso de propósito e segurança psicológica?"
  },
  {
    id: "S5",
    deckType: "S",
    name: "Reunião Difícil com Cliente-Chave",
    situation: "Cliente insatisfeito, ameaça rescindir contrato.",
    challenge: "Como usar storytelling para reconhecer falhas e reconstruir confiança?"
  },
  {
    id: "S6",
    deckType: "S",
    name: "Comunicação de Corte de Custos",
    situation: "Cortes, desligamentos, redução de benefícios.",
    challenge: "Como comunicar com transparência e humanidade?"
  },
  {
    id: "S7",
    deckType: "S",
    name: "Comunicação de Mudança de Estratégia",
    situation: "Empresa muda de rota: mercado, produto ou modelo.",
    challenge: "Como explicar o porquê, o como e o que muda de forma convincente?"
  },
  {
    id: "S8",
    deckType: "S",
    name: "Storytelling de Turnaround",
    situation: "Empresa saiu ou está saindo de uma crise.",
    challenge: "Como contar a história da virada mostrando aprendizados e disciplina?"
  },
  {
    id: "S9",
    deckType: "S",
    name: "Lançamento de Novo Produto",
    situation: "Nova solução que precisa de tração.",
    challenge: "Como posicionar, diferenciar e gerar desejo?"
  },
  {
    id: "S10",
    deckType: "S",
    name: "Relato de Aprendizados Após Fracasso",
    situation: "Projeto importante fracassou.",
    challenge: "Como transformar fracasso em ativo de aprendizado e credibilidade?"
  }
];

export function getCardsByDeck(deckType: DeckType): Card[] {
  return ALL_CARDS.filter(card => card.deckType === deckType);
}

export function getRandomCard(deckType: DeckType): Card {
  const cards = getCardsByDeck(deckType);
  return cards[Math.floor(Math.random() * cards.length)];
}

export function drawRandomCards(): {
  context: Card;
  strategy: Card;
  finance: Card;
  project: Card;
  governance: Card;
  storytelling: Card;
} {
  return {
    context: getRandomCard("C"),
    strategy: getRandomCard("E"),
    finance: getRandomCard("F"),
    project: getRandomCard("P"),
    governance: getRandomCard("G"),
    storytelling: getRandomCard("S"),
  };
}
