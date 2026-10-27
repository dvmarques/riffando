# Design: otimizar CI e eficiência dos agentes

## Alternativas

1. Manter o CI integral em todos os PRs e otimizar apenas cache: risco baixo, menor ganho de latência.
2. CI rápido em PRs e completo no gate de integração: maior ganho, exige revisar proteção de branch, condições de skip e aprovação explícita.
3. CI por caminhos com matriz seletiva: útil, mas perigoso se mudanças de scripts/dependências escaparem; usar fallback completo.

## Estratégia escolhida: rollout em duas fases

A **fase 1** (alternativa 1) é a única aplicada nesta change. Ela não altera jobs, nomes de checks, disparos, `if` de Draft, testes nem o agregador; só remove trabalho repetido. O tempo de parede do CI é ditado pelo job Windows (build Gradle), portanto o único ganho relevante e seguro é reaproveitar saídas de compilação entre execuções com o cache de build do Gradle, que é indexado pelo conteúdo das entradas de cada tarefa. A **fase 2** (alternativas 2 e 3) segue como proposta (seção "Propostas não aplicadas") e depende de aprovação específica do mantenedor.

Justificativa da escolha: o repositório não tem proteção de branch nem rulesets (verificado abaixo), mas a política do projeto exige todos os gates em todos os PRs. Mudar a frequência dos builds seria mudança de política; reaproveitar saídas idênticas não é.

## Matriz de jobs obrigatórios (preservada)

O agregador `gate` exige `success` em todos os jobs abaixo, em qualquer tipo de alteração. Não há filtro por caminho.

| Job (id) | Nome do check | Runner | Função | Obrigatório no gate |
| --- | --- | --- | --- | --- |
| `documentation` | `Documentação e OpenSpec (ubuntu-latest)` / `(windows-latest)` | Linux e Windows | `validate:docs` | Sim (matriz completa) |
| `javascript` | `Qualidade e exportação Android` | Linux | check:env, lint, tipos, tooling, Jest, `check:expo`, export | Sim |
| `windows` | `Instalação e scripts Windows` | Windows | mesmos testes JS na plataforma + prebuild + APK Windows | Sim |
| `android` | `APK Android nativo` | Linux | APK, prova negativa de compilação Kotlin | Sim |
| `emulator` | `Smoke Android offline` | Linux (KVM) | smoke em AVD, depende de `android` | Sim |
| `gate` | `Fundação — gate agregado` | Linux | agrega os cinco jobs acima | É o agregador |

Os nomes não foram alterados. `GITHUB.md` recomenda exigir os checks `Documentação e OpenSpec (…)`; essa recomendação continua válida.

## Tratamento de `skipped`, `cancelled` e ausência no gate

`scripts/ci-gate.mjs` aprova somente se cada job exigido tiver `result === 'success'`; `failure`, `cancelled`, `skipped`, estados intermediários e job ausente em `needs` reprovam. O job `gate` usa `if: always()` (exceto PR Draft), por isso também roda e reprova quando um job é cancelado. `tests/tooling/gate.test.mjs` cobre cada combinação (função e CLI com `toJSON(needs)`), e a lista de jobs do workflow é comparada com a lista do agregador. `skipped` só será aceito na fase 2, com política aprovada, condições verificáveis e testes do agregador.

Em PR Draft todos os jobs ficam `skipped` e o gate também não executa; isso é política existente (`ci-skip-draft-prs`) e não é tratado como aprovação. Para medir o CI completo sem marcar Ready for review usa-se `workflow_dispatch` na branch (o workflow não filtra esse evento).

## Verificação da proteção de branch

Consulta somente leitura em 27/10/2026: `gh api repos/dvmarques/riffando/branches/main/protection` retornou HTTP 404 (`Branch not protected`) e `gh api repos/dvmarques/riffando/rulesets` retornou `[]`. Não há checks obrigatórios configurados; a recomendação de `GITHUB.md` segue sem aplicação. O repositório é público (minutos de runners padrão não são faturados); a soma de minutos é registrada apenas como medida de consumo.

## Mudanças da fase 1

- `scripts/build-android.mjs`: acrescenta `--build-cache` ao `assembleRelease` somente quando a variável `CI` está definida. A chave de cada entrada do cache de build do Gradle depende das entradas (fontes, dependências, versões e argumentos), portanto uma saída reaproveitada é idêntica à que seria compilada. Local e CI sem `CI` continuam sem cache de build.
- `scripts/probe-android-compilation.mjs` **não** muda: a prova negativa altera `MainActivity.kt`, o que invalida a chave da tarefa Kotlin, e o compilador precisa rejeitar o código; essa prova segue sem cache.
- `.github/workflows/ci.yml`: `NPM_CONFIG_AUDIT=false` e `NPM_CONFIG_FUND=false` no ambiente do workflow (sem consulta de auditoria/financiamento em `npm ci` e na instalação global do npm). A auditoria de dependências continua manual (`npm audit`).
- Nenhuma ação, versão, permissão (`contents: read`), nome de job, `needs`, condição de Draft ou timeout foi alterada.
- `tests/tooling/ci-workflow.test.mjs`: invariantes do workflow (permissões mínimas, condição de Draft em todo job, npm fixado em todo job que roda `npm ci`, cache de build apenas em CI e fora da prova negativa, builds nativos e smoke preservados).

### O que foi examinado e mantido

- `npm install --global npm@12.2.1`: **mantido**. O Node 24.21.0 traz npm 11.19.0 (índice oficial de releases do Node), `package.json` fixa `npm@12.2.1` e `check:env` rejeita outra versão. A condição da fase 1 (remover somente se a versão do runner for compatível) não foi atendida.
- `npm run lint` e `typecheck` no job Windows: **mantidos**. São 5–11 s e 3 s dentro de um job de 17–28 min; a economia não justifica reduzir verificações da plataforma.
- `expo prebuild` explícito no job Windows: **mantido**. O passo gera `android/` para `check:env:gradle` antes do build; o segundo prebuild de `build:android` custa 3–5 s.
- Duas execuções de `assembleRelease` no job Linux: **mantidas**. A segunda restaura o APK depois da prova negativa de compilação.
- Gate agregado e testes: **sem mudança**; já tratam `skipped`/`cancelled`/ausência.

## Riscos

- Jobs skipped interpretados como sucesso por branch protection (mitigado: gate exige `success`; fase 1 não usa skip).
- Path filters omitirem alterações transversais (não aplicados).
- Cache de build obsoleto ou contaminado: o Gradle valida as entradas de cada tarefa; o cache é por branch/PR e por sistema operacional; entradas não usadas na execução são removidas na limpeza do `setup-gradle`. PRs só leem caches da própria referência e da `main`. Um PR novo só se beneficia depois que uma execução na `main` gravar o cache.
- Cache de build pode mascarar uma regressão de toolchain quando as entradas das tarefas não mudam; a prova negativa Kotlin e a compilação dos módulos que mudam continuam obrigatórias, e o `emulator` valida o APK resultante.
- Economias de tokens sem medição verificável: nenhuma métrica de tokens é exposta nesse fluxo; nada foi estimado.

## Propostas não aplicadas (fase 2 e ajustes que alteram cobertura ou política)

Nenhuma destas propostas foi aplicada nesta change; todas exigem decisão do mantenedor.

| Proposta | Benefício esperado | Risco |
| --- | --- | --- |
| CI rápido em PRs (docs, JS e Linux) com builds Windows/emulador no gate de integração ou em `ready_for_review` | Feedback em ~1–2 min; reduz o job de 17–30 min em pushes sucessivos | Muda a frequência dos builds; exige ruleset com checks obrigatórios e aprovar `skipped` no agregador |
| Filtro por caminhos com fallback completo | Alterações só de documentação não compilam Android | Escapes por mudanças transversais (scripts, lockfile, workflow); exige classificador testado |
| Windows compilar só `x86_64` (hoje `x86_64,arm64-v8a`) | Menos tarefas CMake no job crítico | Reduz cobertura de compilação arm64 no Windows (Linux continua com as duas ABIs) |
| Dispensar `lintVitalRelease` no Windows | Ganho não medido | Remove uma verificação do build release |
| `timeout-minutes` do job Windows de 30 para 40 | Evita cancelamento por tempo; o run #37 (push na `main`) foi cancelado aos 30m10s, com `build:android` em 25m51s | Jobs travados consomem mais tempo antes de falhar |
| `cancel-in-progress` somente em PRs | Cada commit da `main` obtém gate completo e grava o cache de build usado por PRs | Mais execuções completas na `main` |
| Fixar actions por SHA (hoje por tag principal: `@v6`, `@v4`, `@v5`, `@v3`, `@v2`) | Endurece a cadeia de suprimentos | Custo de manutenção; exige política de atualização |
| ccache/cache de saída CMake | Potencial não medido | Chaves e caminhos específicos por toolchain; não testado |

## Decisões pendentes

Aprovação da política de CI da fase 2 (matriz mínima obrigatória por tipo de alteração e rollout) e de qualquer proposta acima.

## Baseline de três execuções bem-sucedidas

A API `GET /repos/{repo}/actions/runs/{id}/jobs` fornece `started_at` e `completed_at` por job e por step; os números abaixo vêm dela. A afirmação anterior de que a API não fornecia horários por job estava incorreta. Duração de parede = `created_at` → `updated_at` do run; "soma dos jobs" = soma das durações dos 7 jobs (runner-minutos observados, sem arredondar por job).

| Run | Parede | Resultado | `windows` | `android` + `emulator` | Soma Linux | Soma Windows | Soma total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [#31](https://github.com/dvmarques/riffando/actions/runs/40522664541) | 17min40s | success | 17m22s | 13m08s + 3m13s | 18m42s | 19m22s | 38m04s |
| [#34](https://github.com/dvmarques/riffando/actions/runs/40529243530) | 25min55s | success | 24m49s | 12m43s + 3m53s | 18m54s | 26m02s | 44m56s |
| [#36](https://github.com/dvmarques/riffando/actions/runs/40563957799) | 29min24s | success | 28m02s | 16m42s + 3m17s | 22m25s | 29m57s | 52m22s |

Média de parede: **24min20s**; mediana: **25min55s**. Média da soma dos jobs: 45m07s. Os tempos de parede incluem agendamento. O job `windows` define o caminho crítico em todas as execuções; nele, `npm run build:android` levou 13m05s, 20m06s e 20m50s (`Build cache is disabled`, 851 de 851 tarefas executadas no run #36). Na `main`, o run [#37](https://github.com/dvmarques/riffando/actions/runs/40568519633) foi cancelado no limite de 30 min do job Windows (`build:android` com 25m51s) e o gate reprovou. Runs cancelados e Drafts skipped não entram na média.

Etapas medidas em `windows` (run #36): `npm install --global npm@12.2.1` 27 s, `npm ci` 64 s, `test:ci` 29 s, instalação do SDK 65 s, `setup-gradle` 32 s e 118 s no post, `build:android` 1250 s. Em `android` (mesmo run): `build:android` 816 s e prova de compilação 74 s (runs #31 e #34: 636 s e 603 s). Não há métricas de tokens disponíveis nesses runs.
