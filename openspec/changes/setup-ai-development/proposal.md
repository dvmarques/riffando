## Why

Preparar desenvolvimento assistido por IA reproduzível e independente de conversas. Escopo autorizado pelo mantenedor em 26/10/2026: configuração de OpenSpec, Codex e Claude Code e entrega em um PR, sem merge.

## What Changes

- OpenSpec 1.15.0 fixo, integrações oficiais e perfil com verify.
- AGENTS.md central, CLAUDE.md de referência e guia operacional.
- Templates GitHub, CI de documentação/ferramentas e validações reais.
- Registro de referências analisadas, decisões preservadas e limitações.

Fora do escopo: implementar GC-001…GC-041, escolher motor de áudio/monorepo, alterar licença, ativar proteção de main, merge ou archive.

## Capabilities

### New Capabilities

- `ai-development-workflow`: preparação e validação do fluxo de agentes no repositório.

### Modified Capabilities

Nenhuma capacidade do aplicativo.

## Impact

Ferramentas Node somente de desenvolvimento, documentação, .agents, .claude, openspec e .github. Relaciona-se à fundação #1 e à qualidade #14 sem entregar nem fechar essas issues. A issue #11 mantém a proposta de monorepo para refinamento futuro.

## Revisão e autorização

O pedido do mantenedor autoriza esta configuração operacional. Revisão técnica local deve confrontar PRD/arquitetura/licença e diff; aprovação humana final ocorrerá no PR. Nenhuma decisão arquitetural pendente do aplicativo é promovida a aprovada por esta change.
