# Tasks

## 1. Revisores e consistência

- [x] 1.1 Versionar definições Codex equivalentes aos dois revisores Claude.
- [x] 1.2 Verificar automaticamente a equivalência e testar detecção de divergência.
- [x] 1.3 Documentar descoberta, uso e limites; atualizar CHANGELOG.

## 2. Validação

- [x] 2.1 Executar validações proporcionais e `npm run validate`, registrar evidências e limitações.
- [x] 2.2 Revisar o diff e a coerência com a change.

Evidências: `npm run validate` passou (inclui 6 testes de revisores, 68 testes de tooling da fundação e 14 testes mobile). Diff revisado; discovery confirmado em sessão Codex nova na worktree; execução dos revisores não verificada. CI depende da PR.

## 3. CI proporcional (Refs #59)

- [x] 3.1 Classificar PRs por diff completo, com whitelist conservadora e matriz completa para CI, app, dependências e caminhos desconhecidos.
- [x] 3.2 Adaptar workflow e gate para exigir os jobs apropriados, falhando quando classificação ou resultados esperados estiverem ausentes.
- [x] 3.3 Testar classificação, Draft, gatilhos, gate e regressões; atualizar documentação e changelog.
- [x] 3.4 Executar validação completa, revisar diff e registrar evidências.

Evidências CI proporcional: `npm run validate` passou; testes direcionados incluem merge-base e diff Git real, renome, modos de arquivo, fallback completo e gate; revisão Claude concluída sem achados bloqueantes. A PR que altera CI ainda exige matriz completa.

## 4. Compatibilidade Expo

- [x] 4.1 Atualizar React Native ao patch exigido, lockfile e matriz; avaliar licenças e registrar efeitos na documentação.
- [x] 4.2 Executar instalação, validação, Expo doctor e exportação; registrar resultados e limitações.
- [x] 4.3 Revisar diff e obter revisão do Claude; corrigir os achados verificáveis.

Evidências patch: `npm ci --ignore-scripts`, `npm run validate` (81 testes tooling e 14 mobile), `npm run check:expo` (20/20) e `npm run export:android` passaram localmente. Builds nativos e CI serão conferidos na PR; não há nova validação física.

Revisão Claude do patch: sem achados bloqueantes; referências históricas e inventário foram identificados explicitamente. Builds nativos e CI continuam sujeitos aos gates da PR.

CI pré-archive: run 40895886806 no commit 9ee4166 passou integralmente, incluindo gate, builds Android Linux/Windows, testes Kotlin e smoke offline. Revisões Claude sem achados pendentes.
