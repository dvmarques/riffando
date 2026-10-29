# Tasks

## 1. Revisores e consistência

- [x] 1.1 Versionar definições Codex equivalentes aos dois revisores Claude.
- [x] 1.2 Verificar automaticamente a equivalência e testar detecção de divergência.
- [x] 1.3 Documentar descoberta, uso e limites; atualizar CHANGELOG.

## 2. Validação

- [x] 2.1 Executar validações proporcionais e `npm run validate`, registrar evidências e limitações.
- [x] 2.2 Revisar o diff e a coerência com a change.

Evidências: `npm run validate` passou (inclui teste de divergência, 68 testes de tooling e 14 testes mobile). Diff revisado; discovery real nesta sessão pré-existente, sem comprovar execução dos revisores na nova worktree. CI depende da PR.
