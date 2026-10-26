## CI

- [x] 1.1 Ignorar o job `quality` em PRs Draft e incluir `ready_for_review` nos tipos de `pull_request`.
- [x] 1.2 Documentar o comportamento em `docs/development/GITHUB.md` e registrar no changelog.

## Verificação

- [ ] 2.1 Confirmar que a PR Draft desta change tem o check skipped e que, ao marcá-la Ready, Linux e Windows executam e passam no commit corrente.
- [ ] 2.2 Executar `npm run validate` e `openspec validate --all --strict` localmente.
