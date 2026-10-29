# Tasks

## 1. Revisores e consistência

- [x] 1.1 Versionar definições Codex equivalentes aos dois revisores Claude.
- [x] 1.2 Verificar automaticamente a equivalência e testar detecção de divergência.
- [x] 1.3 Documentar descoberta, uso e limites; atualizar CHANGELOG.

## 2. Validação

- [x] 2.1 Executar validações proporcionais e `npm run validate`, registrar evidências e limitações.
- [x] 2.2 Revisar o diff e a coerência com a change.

Evidências: `npm run validate` passou (inclui 6 testes de revisores, 68 testes de tooling da fundação e 14 testes mobile). Diff revisado; discovery confirmado em sessão Codex nova na worktree; execução dos revisores não verificada. CI depende da PR.
