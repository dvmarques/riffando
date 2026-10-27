# Proposta: otimizar CI e eficiência dos agentes

Issue: <https://github.com/dvmarques/riffando/issues/57>

## Motivação

O CI #36 teve Windows ~28 min e Android Linux ~17 min, com validações repetidas. Agentes Claude/Codex podem gastar contexto em leituras e revisões redundantes.

## Escopo

- Medir baseline de tempo de feedback, runner-minutes e tokens (quando observáveis).
- Projetar execução incremental de validações e caching, preservando cobertura Linux, Windows, Android e smoke.
- Melhorar seleção de contexto e revisões por risco nos agentes, mantendo AGENTS.md canônico.

## Fora do escopo

Features do aplicativo, novas dependências de produto, alterações de licença, branch protection, exclusão de verificações obrigatórias sem aprovação, merge e archive.

## Critérios de aceite

- Baseline e comparação reproduzível.
- Gates preservados ou alteração de política aprovada explicitamente.
- Testes de caminhos críticos, docs-only e mudança nativa.
- Evidências de CI e revisão final em PR; métricas de tokens apenas quando disponíveis.

## Status e autorização

Proposta preparada para revisão. A autorização para criar issue e preparar change não equivale a aprovação do desenho nem autorização de Apply. Mudanças de política de CI requerem aprovação explícita.
