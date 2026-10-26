## Why

O CI de Pull Request executa em PRs Draft, gastando minutos de Linux e Windows em trabalho ainda em andamento. O Admin DS já valida apenas PRs Ready for review; o Riffando deve seguir o mesmo critério.

## What Changes

- O job `quality` do workflow `CI` passa a ser ignorado (skipped) enquanto a PR estiver em Draft.
- O gatilho `pull_request` passa a incluir `ready_for_review`, para que marcar a PR como pronta dispare a validação completa sobre o commit corrente.
- `push` na `main` e `workflow_dispatch` continuam executando normalmente.
- Documentação do comportamento em `docs/development/GITHUB.md` e entrada no changelog.

## Capabilities

### New Capabilities

Nenhuma. Manutenção de tooling sem alteração de capacidade; `skip_specs: true` nos metadados, sem deltas funcionais fictícios.

## Impact

Apenas `.github/workflows/ci.yml` e documentação. Nenhum app, dependência, regra de proteção de branch ou política de merge alterada. Os gates de CI verde no commit final permanecem: PRs Draft não têm CI, então a PR precisa estar Ready para ser integrada.
