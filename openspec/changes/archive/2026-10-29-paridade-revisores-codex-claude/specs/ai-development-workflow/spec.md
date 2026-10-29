# ai-development-workflow

## ADDED Requirements

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
