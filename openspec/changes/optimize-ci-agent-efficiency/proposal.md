# Proposta: otimizar CI e eficiência dos agentes

Issue: <https://github.com/dvmarques/riffando/issues/57>

## Motivação

O CI #36 teve Windows ~28 min e Android Linux ~17 min, com validações repetidas e sem cache de build do Gradle (851 de 851 tarefas executadas em cada run). Agentes Claude/Codex podem gastar contexto em leituras e revisões redundantes (arquivos gerados, logs completos de CI).

## Escopo

- Medir baseline de tempo de feedback e runner-minutos; tokens apenas quando houver métrica observável.
- **Fase 1 (aplicada nesta change):** reaproveitar saídas de build e remover trabalho repetido sem alterar jobs, checks, disparos, gate nem cobertura (Linux, Windows, Android e smoke).
- **Fase 2 (proposta, depende de aprovação):** execução incremental de validações por tipo de alteração e mudança de frequência dos builds. Documentada em `design.md`, sem aplicação.
- Melhorar seleção de contexto e revisões por risco nos agentes, mantendo `AGENTS.md` canônico e sem criar instruções concorrentes.

## Fora do escopo

Features do aplicativo, novas dependências de produto, alterações de licença, branch protection ou rulesets, exclusão de verificações obrigatórias sem aprovação, merge e archive.

## Critérios de aceite

- Baseline e comparação reproduzíveis (comandos `gh api` e runs citados), com limitações explícitas.
- Gates preservados; mudança de política só com aprovação explícita (fase 2 não aplicada).
- Testes do agregador e invariantes do workflow; para `skipped`/`cancelled`/ausência o gate reprova.
- Evidências de CI no commit final e revisão final em PR; métricas de tokens apenas quando disponíveis; economia só é afirmada quando medida.

## Status e autorização

A autorização para criar issue e preparar change não equivale à aprovação do desenho nem à autorização de Apply além do que está registrado na issue e na PR. Mudanças de política de CI (fase 2) requerem aprovação explícita. Esta change declara `skip_specs: true` em `.openspec.yaml`: não altera requisitos de produto, apenas tooling e documentação (precedente: `ci-skip-draft-prs`).
