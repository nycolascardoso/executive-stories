# Executive Stories - Treinamento Executivo

## Overview

Executive Stories é um jogo sério para executivos com visual inspirado em Yu-Gi-Oh/Balatro. A aplicação simula cenários corporativos complexos usando um sistema de baralhos onde o jogador recebe cartas e deve diagnosticar, decidir e construir narrativas de negócios.

## Current State

MVP completo com:
- **3-Zone Card Game Layout**: Layout inspirado em Yu-Gi-Oh/Balatro
  - Zona de mão (inferior 25%): Cartas do jogador em leque
  - Mesa de reunião (centro 55%): 6 slots para cartas
  - Avatares executivos (superior 20%): CEO, CFO, COO, Board
- Sistema de 6 baralhos com 60 cartas (Contexto, Estratégia, Finanças, Projetos, Governança, Storytelling)
- **Click-to-place**: Clique em uma carta para colocá-la na mesa
- **Boss Mode**: Executivos fazem perguntas contextuais baseadas nas cartas
- **Voice Input**: Entrada por voz (Web Speech API) para respostas
- Fluxo de jogo: sorteio → colocação de cartas → diagnóstico → decisão → execução → storytelling
- Sistema de pontuação com feedback AI detalhado
- Histórico de sessões e rodadas
- Modo solo e grupo
- Tema claro/escuro

## Project Architecture

```
├── client/src/
│   ├── components/
│   │   ├── CardHand.tsx       # Cartas na mão do jogador (click-to-place)
│   │   ├── MeetingTable.tsx   # Mesa de reunião com slots droppable
│   │   ├── ExecutiveAvatars.tsx # Avatares CEO/CFO/COO/Board + Boss Mode
│   │   ├── GameArena.tsx      # Layout 3 zonas + DndContext
│   │   ├── VoiceInput.tsx     # Componente de entrada por voz
│   │   ├── GameCard.tsx       # Cards de jogo e pilhas de deck
│   │   ├── ResponseForm.tsx   # Formulário com voice input
│   │   ├── ScoreDisplay.tsx   # Exibição de pontuação
│   │   └── ThemeToggle.tsx    # Toggle dark/light
│   ├── lib/
│   │   └── executiveQuestions.ts # Banco de perguntas por executivo
│   ├── pages/
│   │   ├── home.tsx          # Página inicial
│   │   └── game.tsx          # Página do jogo
│   └── App.tsx               # Configuração de rotas
├── server/
│   ├── routes.ts             # Endpoints da API
│   ├── aiService.ts          # Serviço OpenAI para avaliação
│   └── storage.ts            # Armazenamento PostgreSQL
└── shared/
    ├── schema.ts             # Tipos e schemas Drizzle
    └── cardData.ts           # Dados das 60 cartas
```

## Key Files

- `client/src/components/GameArena.tsx` - Layout principal do jogo com 3 zonas
- `client/src/components/CardHand.tsx` - Cartas em leque com click-to-place
- `client/src/components/MeetingTable.tsx` - Mesa com 6 slots para cartas
- `client/src/components/ExecutiveAvatars.tsx` - Boss Mode com perguntas contextuais
- `client/src/lib/executiveQuestions.ts` - Banco de perguntas por executivo/categoria
- `shared/cardData.ts` - Todas as 60 cartas do jogo em português

## Design System

- **Tema**: Executive Balatro (preto/grafite/vinho/âmbar)
- **Cores por categoria**:
  - Contexto (C): Âmbar
  - Estratégia (E): Esmeralda  
  - Finanças (F): Ciano
  - Projetos (P): Azul
  - Governança (G): Roxo
  - Storytelling (S): Rosa
- **Fontes**: Cinzel (display), Outfit (body), JetBrains Mono (código)
- **Animações**: Framer Motion para transições suaves

## User Preferences

- Interface em português brasileiro
- Design premium "Executive Balatro"
- Zero sensação de formulário - tudo deve parecer um jogo de cartas
- Suporte a dark mode

## Recent Changes

- 2024-12-09: Melhorias de Dificuldade e Performance
  - Mínimo de cartas por dificuldade: iniciante=1, intermediário/avançado=3
  - Boss Mode ativado automaticamente para intermediário/avançado
  - Speech-to-text otimizado com ciclo de reconhecimento mais rápido
  - Aviso visual quando número mínimo de cartas não é atingido
  - Feedback por executivo (CEO/CFO/COO/Board) com metodologia Harvard/MIT/Stanford
  - Perguntas contextuais baseadas nas respostas do jogador
- 2024-12-08: 3-Zone Card Game Layout
  - Implementado layout Yu-Gi-Oh/Balatro com CardHand, MeetingTable, ExecutiveAvatars
  - Click-to-place para colocação de cartas
  - Boss Mode com perguntas contextuais de CEO/CFO/COO/Board
  - Voice Input (Web Speech API) para entrada por voz
  - @dnd-kit instalado para suporte a drag-and-drop
- 2024-12-08: MVP inicial completo
  - Implementado sistema de baralhos e cartas
  - Criado fluxo de jogo de 5 etapas
  - Sistema de pontuação baseado em 4 critérios
  - Interface responsiva com Tailwind CSS
