## Context

Repositório de planejamento com 10 épicos e 41 tarefas, sem app, scripts ou OpenSpec prévios. Referência principal: admin-design-system (AGENTS central e integrações geradas); referências complementares: back-admin e leaf-admin (contratos estáveis e mudanças pequenas). Não incorporar detalhes privados dessas aplicações ao projeto público.

## Goals / Non-Goals

Reprodução por npm ci e scripts versionados; docs, skills e validação em CI. Sem app, scaffolding Expo, pastas vazias, workspaces, código de áudio ou alterações nas 41 tarefas.

## Decisions

- OpenSpec 1.15.0 estável, schema oficial spec-driven e templates da dependência fixada. Regras específicas em config.yaml evitam fork prematuro de schema.
- Perfil custom: explore, propose, apply, verify, update, sync e archive. Gerar com CLI oficial usando configuração XDG temporária, preservando preferências pessoais.
- Codex skills em .agents; Claude skills e comandos próprios. Preservar ambos os formatos gerados oficialmente em vez de symlinks que prejudicam Windows. AGENTS contém a política comum; CLAUDE só referencia/importa AGENTS.
- Ferramentas Node na raiz não constituem monorepo nem fundação mobile. Organização final do aplicativo permanece pendente de #11; app único é alternativa a avaliar.
- CI executa Markdown, links locais, integridade da geração, smoke do CLI e validação estrita. Gates mobile entram em #14 junto aos scripts reais.
- Archive da change real permanece bloqueado até autorização e merge; testar lifecycle somente em diretório temporário descartável.

## Risks / Trade-offs

Discovery de skills exige reinício das sessões. CLI não é agente autenticado: inspeção e smoke não comprovam execução ponta a ponta em Codex/Claude. Arquivos gerados por ferramenta são necessários para compatibilidade e conferidos por regeneração. Perfil global do OpenSpec exige isolamento no wrapper; usar ai:update em vez de update global sem perfil.

## Migration Plan

Sem migração do app. Reverter o PR remove a configuração. Atualizações futuras mudam versão/lock, regeneram integrações e repetem validate em PR. Após merge autorizado, sincronizar/arquivar em PR de acompanhamento autorizado.
