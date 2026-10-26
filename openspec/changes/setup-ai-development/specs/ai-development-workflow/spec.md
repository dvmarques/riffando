## Purpose

Manter preparação reproduzível de agentes e gates de desenvolvimento no repositório Riffando.

## ADDED Requirements

### Requirement: Instruções canônicas

O repositório MUST manter AGENTS.md como guia operacional comum e CLAUDE.md somente como referência a ele.

#### Scenario: Retomada por outro agente

- **WHEN** um agente inicia trabalho na raiz
- **THEN** encontra as fontes obrigatórias e limites do escopo por AGENTS.md sem depender de conversas anteriores

### Requirement: Integrações reproduzíveis

O projeto MUST fixar OpenSpec e gerar suas integrações oficiais para Codex e Claude Code sem alterar preferências globais da máquina.

#### Scenario: Instalação em checkout limpo

- **WHEN** o desenvolvedor executa npm ci e npm run ai:setup
- **THEN** são disponibilizadas skills Codex e skills/comandos Claude com explore, propose, apply, verify, update, sync e archive

### Requirement: Gates de desenvolvimento

O fluxo MUST preservar Explore somente leitura, revisão de proposta e código, CI e aprovação explícita para merge e archive.

#### Scenario: PR de preparação

- **WHEN** as ferramentas são configuradas e validadas
- **THEN** o agente abre PR com evidências e limitações sem iniciar funcionalidades nem fazer merge ou arquivar a change real
