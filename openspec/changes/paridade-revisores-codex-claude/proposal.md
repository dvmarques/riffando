# Proposal

## Why

Os revisores consultivos versionados para Claude não estão disponíveis em um checkout limpo do Codex. O mantenedor solicitou comportamento equivalente entre os agentes.

## What Changes

- Disponibilizar os revisores de arquitetura e acessibilidade também no Codex, com instruções equivalentes.
- Verificar a equivalência e documentar uso e limitações.
- Preservar as integrações OpenSpec oficiais existentes, sem duplicar comandos migrados.

Critérios: ambos os revisores são descobertos pelo Codex, mantêm a mesma orientação consultiva do Claude e a validação detecta divergência. Fora do escopo: mudanças no aplicativo, permissões globais, modelos e novas integrações. Refs #54 (workflow adaptativo); solicitação do mantenedor nesta tarefa.

## Capabilities

### New Capabilities

Nenhuma. Manutenção de tooling existente; skip_specs justificado.

### Modified Capabilities

Nenhuma.

## Impact

Arquivos de configuração de agentes, validação de tooling, guia e changelog. Sem dependências novas ou mudanças de produto.
