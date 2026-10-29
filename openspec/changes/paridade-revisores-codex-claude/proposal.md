# Proposal

## Why

Os revisores consultivos versionados para Claude não estão disponíveis em um checkout limpo do Codex. O mantenedor solicitou comportamento equivalente entre os agentes.

## What Changes

- Disponibilizar os revisores de arquitetura e acessibilidade também no Codex, com instruções equivalentes.
- Verificar a equivalência e documentar uso e limitações.
- Preservar as integrações OpenSpec oficiais existentes, sem duplicar comandos migrados.
- Selecionar validações do CI por impacto em PRs prontas, com fallback completo conservador e gate verificável (Refs #59).

Critérios: PRs apenas de documentação e agentes executam documentação; mudanças desconhecidas, app, dependências ou CI exigem matriz completa; Draft não executa CI; push em main e execução manual preservam matriz completa. O gate falha se classificação ou jobs exigidos não tiverem sucesso. Ambos os revisores são descobertos pelo Codex, mantêm a mesma orientação consultiva do Claude e a validação detecta divergência. Fora do escopo: mudanças no aplicativo, permissões globais, modelos e novas integrações. Refs #54 (workflow adaptativo); solicitação do mantenedor nesta tarefa.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `ai-development-workflow`: seleção conservadora de jobs por impacto e gate que exige resultados conforme a classificação.

## Impact

Arquivos de configuração de agentes, validação de tooling, guia e changelog. Sem dependências novas ou mudanças de produto.
