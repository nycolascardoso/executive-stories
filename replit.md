# Executive Stories - Treinamento Executivo

## Overview

Executive Stories é um jogo sério para executivos, focado em estratégia, finanças corporativas, gestão de projetos, governança e storytelling executivo. A aplicação simula cenários corporativos complexos usando um sistema de baralhos onde o jogador recebe cartas e deve diagnosticar, decidir e construir narrativas de negócios.

## Current State

MVP completo com:
- Sistema de 6 baralhos com 60 cartas (Contexto, Estratégia, Finanças, Projetos, Governança, Storytelling)
- Fluxo de jogo: sorteio de cartas → diagnóstico → decisão → execução → storytelling
- Sistema de pontuação com feedback
- Histórico de sessões e rodadas
- Modo solo e grupo
- Tema claro/escuro

## Project Architecture

```
├── client/src/
│   ├── components/
│   │   ├── GameCard.tsx       # Cards de jogo e pilhas de deck
│   │   ├── GameStepIndicator.tsx # Indicador de etapas
│   │   ├── ResponseForm.tsx   # Formulário de respostas
│   │   ├── ScoreDisplay.tsx   # Exibição de pontuação
│   │   ├── SessionHistory.tsx # Histórico e estatísticas
│   │   ├── ThemeProvider.tsx  # Provider de tema
│   │   └── ThemeToggle.tsx    # Toggle dark/light
│   ├── pages/
│   │   ├── home.tsx          # Página inicial
│   │   └── game.tsx          # Página do jogo
│   └── App.tsx               # Configuração de rotas
├── server/
│   ├── routes.ts             # Endpoints da API
│   └── storage.ts            # Armazenamento em memória
└── shared/
    ├── schema.ts             # Tipos e schemas
    └── cardData.ts           # Dados das 60 cartas
```

## Key Files

- `shared/cardData.ts` - Contém todas as 60 cartas do jogo em português
- `shared/schema.ts` - Define tipos TypeScript para sessões, rodadas, cartas e pontuação
- `server/storage.ts` - Implementação de armazenamento em memória com cálculo de pontuação
- `client/src/pages/game.tsx` - Lógica principal do jogo

## User Preferences

- Interface em português brasileiro
- Design profissional e executivo
- Suporte a dark mode

## Recent Changes

- 2024-12-08: MVP inicial completo
  - Implementado sistema de baralhos e cartas
  - Criado fluxo de jogo de 5 etapas
  - Sistema de pontuação baseado em 4 critérios
  - Interface responsiva com Tailwind CSS
