## Context

Repositório de planejamento com 10 épicos e 41 tarefas, sem app, scripts ou OpenSpec prévios. Referência principal: admin-design-system (AGENTS central e integrações geradas); referências complementares: back-admin e leaf-admin (contratos estáveis e mudanças pequenas). Não incorporar detalhes privados dessas aplicações ao projeto público.

## Goals / Non-Goals

Reprodução por npm ci e scripts versionados; docs, skills e validação em CI. Sem app, scaffolding Expo, pastas vazias, workspaces, código de áudio ou alterações nas 41 tarefas.

## Decisions

- AGENTS concentra políticas comuns; config.yaml concentra contexto e regras OpenSpec. AI_WORKFLOW é somente tutorial, sem política paralela.
- OpenSpec 1.15.0 estável, schema oficial spec-driven e templates da dependência fixada. Regras específicas em config.yaml evitam fork prematuro de schema.
- Perfil custom: explore, propose, apply, verify, update, sync e archive. Gerar com CLI oficial usando `XDG_CONFIG_HOME`, `XDG_DATA_HOME` e `CODEX_HOME` temporários, preservando preferências, schemas e prompts Codex pessoais.
- Codex skills em .agents; Claude skills e comandos próprios. Preservar ambos os formatos gerados oficialmente em vez de symlinks que prejudicam Windows. AGENTS contém a política comum; CLAUDE só referencia/importa AGENTS.
- Ferramentas Node na raiz não constituem monorepo nem fundação mobile. Organização final do aplicativo permanece pendente de #11; app único é alternativa a avaliar.
- CI executa Markdown, links locais, integridade da geração, smoke do CLI e validação estrita. Gates mobile entram em #14 junto aos scripts reais.
- Padrão aprovado: concluir todas as tarefas, obter autorização aplicável e arquivar/sincronizar na branch da PR antes do merge por squash. Testes de lifecycle continuam em diretório temporário descartável; executar archive real somente quando autorizado.

## Risks / Trade-offs

Discovery de skills exige reinício das sessões. CLI não é agente autenticado: inspeção e smoke não comprovam execução ponta a ponta em Codex/Claude. Arquivos gerados por ferramenta são necessários para compatibilidade e conferidos por regeneração. Perfil global do OpenSpec exige isolamento no wrapper; usar ai:update em vez de update global sem perfil.

## Migration Plan

Sem migração do app. Reverter o PR remove a configuração. Atualizações futuras mudam versão/lock, regeneram integrações e repetem validate em PR. Concluir todas as tarefas e arquivar/sincronizar na mesma PR antes do squash autorizado. Somente uma restrição concreta documentada e aprovada permite integrar primeiro e arquivar em PR de acompanhamento, também por squash.

## Revisão complementar — PR #52

A validação normaliza somente CRLF/LF ao comparar integrações oficiais, preservando a detecção de mudanças de conteúdo no Windows. CI executa os mesmos gates em Linux e Windows. Markdownlint-cli2 0.24.0 (MIT) substitui 0.20.0 para corrigir dependências vulneráveis. Um override limitado a micromark-extension-math fixa KaTeX 0.18.2 (MIT), pois a faixa transitiva 0.16 ainda contém o advisory GHSA-238p-pmpm-9mq7; validar parsing matemático e remover o override quando o upstream aceitar uma versão corrigida. OpenSpec permanece 1.15.0. Changelog registra a preparação em Unreleased.

Segunda revisão: em modo não interativo, `init`/`update --force` do OpenSpec 1.15.0 removem prompts Codex legados (`opsx-*.md`) de `$CODEX_HOME/prompts` ou `~/.codex/prompts`, fora do repositório; como `ai:check` executa `init`, `npm run validate` apagava esses arquivos pessoais. Os wrappers passam a isolar `CODEX_HOME` e `XDG_DATA_HOME` (overrides de schema do usuário), e `ai:check` contém regressão que exige a preservação de um prompt global descartável. Parsing e renderização matemática com KaTeX 0.18.2 foram validados via micromark-extension-math e markdownlint.
