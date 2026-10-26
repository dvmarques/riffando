# Mapa de contexto para agentes

Leia primeiro [AGENTS.md](../AGENTS.md) e a issue. Este índice é uma rota de leitura, não substitui políticas e não autoriza implementação.

| Escopo | Fontes existentes | Verificação prioritária |
| --- | --- | --- |
| Fundamentos e ferramentas | [contexto](PROJECT_CONTEXT.md), [decisões](DECISIONS.md), [workflow](development/AI_WORKFLOW.md) | `npm run validate`, CI Linux/Windows |
| Produto, experiência e exercícios | [PRD](product/PRD.md), [roadmap](product/ROADMAP.md) | critérios de aceite, pt-BR, pedagogia e acessibilidade |
| Arquitetura e módulos futuros | [arquitetura](architecture/ARCHITECTURE.md), [modelo de dados](architecture/DATA_MODEL.md) | contratos, acoplamento, decisão aprovada |
| Áudio e afinador futuros | [arquitetura](architecture/ARCHITECTURE.md), [PRD](product/PRD.md) | permissões, dispositivos físicos, ruído, latência mensurada |
| Persistência e migrações futuras | [modelo de dados](architecture/DATA_MODEL.md), [decisões](DECISIONS.md) | offline, migração, recuperação, proteção de dados |
| Interface e acessibilidade futura | [PRD](product/PRD.md), [arquitetura](architecture/ARCHITECTURE.md) | alvos de toque, leitor de tela, foco e texto escalável |
| OpenSpec | [config](../openspec/config.yaml), `openspec/changes`, `openspec/specs` | `npm run validate:openspec` |
| GitHub e CI | [guia GitHub](development/GITHUB.md), [validações](development/VALIDATION.md) | jobs efetivamente executados, SHA final |
| Modelos e skills | [modelos](models.md), [workflow](development/AI_WORKFLOW.md) | consistência das skills; não editar geradas |

## Leitura incremental
1. Identifique issue, arquivos e change; leia as políticas de AGENTS.md e a configuração OpenSpec.
2. Leia fontes específicas do domínio acima, depois arquivos diretamente afetados; não carregue o repositório inteiro sem necessidade.
3. Amplie o contexto em alterações críticas, dependências entre domínios ou duas tentativas sem progresso.
4. Registre decisões e evidências no GitHub; não converta hipóteses em aprovações.

Não existem ainda diretórios de app, testes mobile, módulos nativos ou código Expo. Os itens futuros da tabela são **cenários de aplicação** do mapa, não caminhos atuais.
