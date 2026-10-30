# ai-development-workflow Specification

## Purpose

Manter preparação reproduzível de agentes e gates de desenvolvimento no repositório Riffando.

## Requirements

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
- **THEN** o agente abre PR com evidências e limitações sem iniciar funcionalidades nem executar archive ou merge sem autorização aplicável

### Requirement: Conclusão antes da integração

O fluxo MUST exigir todas as tarefas realmente concluídas antes do archive e MUST, por padrão, sincronizar e arquivar a change na branch da PR antes de integrar. Todo merge MUST usar squash, inclusive PRs de acompanhamento.

#### Scenario: Fluxo padrão

- **WHEN** as entregas da change estão concluídas e há revisão, CI verde e autorização de arquivamento
- **THEN** o agente sincroniza specs e arquiva na branch da PR, revisa e valida o diff final, aguarda CI verde e só executa squash merge com aprovação e autorização aplicáveis

#### Scenario: Checklist sem dependência circular

- **WHEN** uma tarefa descreve autorização, execução do próprio archive/merge ou fechamento administrativo após merge
- **THEN** essa ação fica no checklist da PR, preservando em tasks.md as entregas e os critérios de aceite reais, sem marcá-los como concluídos antes de executá-los

#### Scenario: Restrição de integração prévia

- **WHEN** uma entrega ou validação realmente depende de estar em main ou develop e a restrição, evidência, tarefas dependentes e sequência alternativa foram documentadas e aprovadas
- **THEN** a PR pode ser integrada por squash com a change ativa, as tarefas dependentes permanecem abertas até sua execução e o archive ocorre somente após todas serem concluídas, em PR de acompanhamento também integrada por squash

### Requirement: CI proporcional por impacto

O CI MUST executar validação documental em PRs prontas e MUST executar a matriz completa quando o diff contiver app, dependências, CI ou caminhos não reconhecidos. Push na main e execução manual MUST executar matriz completa. PR Draft MUST manter os jobs de CI pulados.

#### Scenario: PR apenas documental

- **WHEN** todos os caminhos alterados são reconhecidos como documentação ou configurações de agentes
- **THEN** a validação documental executa e os jobs de build e testes do aplicativo são dispensados

#### Scenario: Escopo desconhecido ou CI

- **WHEN** algum caminho alterado não é reconhecido como documental ou altera o próprio CI
- **THEN** toda a matriz de validação executa

#### Scenario: Falha de seleção ou job necessário

- **WHEN** a classificação não conclui com sucesso ou um job exigido não conclui com sucesso
- **THEN** o gate falha e não representa a execução como aprovada
