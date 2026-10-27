# Design: otimizar CI e eficiência dos agentes

## Alternativas

1. Manter o CI integral em todos os PRs e otimizar apenas cache: risco baixo, menor ganho de latência.
2. CI rápido em PRs e completo no gate de integração: maior ganho, exige revisar proteção de branch, condições de skip e aprovação explícita.
3. CI por caminhos com matriz seletiva: útil, mas perigoso se mudanças de scripts/dependências escaparem; usar fallback completo.

## Estratégia escolhida: rollout em duas fases

A **fase 1** (alternativa 1) é a única aplicada nesta change. Ela não altera jobs, nomes de checks, disparos, `if` de Draft, testes nem o agregador; reaproveita trabalho repetido e ajusta apenas o limite de tempo do job Windows. O tempo de parede do CI é ditado pelo job Windows (build Gradle), portanto o único ganho relevante e seguro é reaproveitar saídas de compilação entre execuções com o cache de build do Gradle, que é indexado pelo conteúdo das entradas de cada tarefa. A **fase 2** (alternativas 2 e 3) segue como proposta (seção "Propostas não aplicadas") e depende de aprovação específica do mantenedor.

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
- `.github/workflows/ci.yml`: `timeout-minutes` do job `windows` de 30 para 45. Sem esse ajuste o job era cancelado pelo limite em execuções frias: o run #37 (push na `main`) e a execução manual A desta change (`workflow_dispatch`, cache vazio) foram cancelados aos 30 min com `npm run build:android` ainda em andamento, o gate reprovou e nenhum cache de build do Windows era gravado (o passo de pós-processamento do `setup-gradle` só grava cache quando o job conclui). O aumento não reduz cobertura nem muda nomes; um job travado passa a levar até 15 min a mais para falhar.
- Nenhuma ação, versão, permissão (`contents: read`), nome de job, `needs` ou condição de Draft foi alterada.
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
| `cancel-in-progress` somente em PRs | Cada commit da `main` obtém gate completo e grava o cache de build usado por PRs | Mais execuções completas na `main` |
| Fixar actions por SHA (hoje por tag principal: `@v6`, `@v4`, `@v5`, `@v3`, `@v2`) | Endurece a cadeia de suprimentos | Custo de manutenção; exige política de atualização |
| ccache/cache de saída CMake | As 49–50 tarefas `buildCMake*` nunca vêm do cache de build e dominam o job; potencial não medido | Chaves e caminhos específicos por toolchain; não testado |

## Decisões pendentes

Aprovação da política de CI da fase 2 (matriz mínima obrigatória por tipo de alteração e rollout) e de qualquer proposta acima.

## Resultados medidos da fase 1

Medições feitas por `workflow_dispatch` na branch da PR (a PR Draft não executa jobs). A: [run 40578545686](https://github.com/dvmarques/riffando/actions/runs/40578545686), SHA `f59c78b`, sem entradas de cache de build na branch (o Linux restaurou apenas o `gradle-home` da `main`). B: [run 40583313744](https://github.com/dvmarques/riffando/actions/runs/40583313744), SHA `0d790aa`, com timeout do Windows em 45 min; Linux com cache gravado por A, Windows ainda sem cache (primeira gravação). O run C (Windows com cache quente, [run 40587833695](https://github.com/dvmarques/riffando/actions/runs/40587833695)) foi disparado depois e seu resultado é registrado na PR (pendente neste documento).

| Run | Parede | Resultado | `windows` | `android` + `emulator` | Soma Linux | Soma Windows | Soma total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Baseline #31 / #34 / #36 | 17m40s / 25m55s / 29m24s (média 24m20s) | success | 17m22s / 24m49s / 28m02s | 13m08s + 3m13s / 12m43s + 3m53s / 16m42s + 3m17s | 18m42s / 18m54s / 22m25s | 19m22s / 26m02s / 29m57s | 38m04s / 44m56s / 52m22s |
| A (`f59c78b`, cache vazio) | 30m21s | cancelled (timeout de 30 min do Windows; gate falhou como esperado) | 30m07s (cancelado) | 10m46s + 3m26s | 16m02s | 32m02s | 48m04s |
| B (`0d790aa`, Linux quente, Windows frio) | 31m10s | success | 30m57s | 12m11s + 3m23s | 17m16s | 32m44s | 50m00s |

Runner-minutos observáveis = soma das durações dos jobs; o repositório é público, portanto sem custo faturado.

Cache de build do Gradle (contagens do próprio Gradle nos logs):

| Job | Cache restaurado | Tarefas | Tempo Gradle `assembleRelease` | Passo `build:android` |
| --- | --- | --- | --- | --- |
| Linux, baseline #36 | desativado | 851 de 851 executadas | n/d | 816 s |
| Linux, A | `gradle-home` da `main` (miss das entradas de build) | 737 executadas, 114 do cache | 8m25s | 511 s |
| Linux, B | `gradle-home` gravado por A (54 MiB; hit) | 535 executadas, 316 do cache | 8m40s | 529 s |
| Windows, B | "Gradle User Home cache not found" (miss) | 738 executadas, 113 do cache | 25m26s | 1534 s |

Em Linux, as tarefas de compilação Kotlin/Java foram de 38 executadas (A) para 0 executadas e 37 vindas do cache (B). As 49–50 tarefas `buildCMake*`/`Cxx` (compilação nativa C++) foram executadas em A e B e **nunca** vieram do cache (o AGP não as torna cacheáveis). Elas dominam o tempo restante; por isso o cache de build funciona (hit comprovado) mas **não reduziu o tempo de parede de forma demonstrável**: 8m25s (A) contra 8m40s (B) no Linux, e a variação entre execuções equivalentes do Windows no baseline (17–28 min) e em A/B (≥ 30 min) é maior do que qualquer efeito do cache. As linhas `Build cache is disabled` ao final do log Windows pertencem a invocações auxiliares posteriores (`BUILD SUCCESSFUL in 13s`), não ao `assembleRelease`.

Conclusões e limites:

- **Economia de tempo da fase 1: pendente / não comprovada.** Nenhuma porcentagem é afirmada. Parede de A e B (30–31 min) ficou acima do baseline (média 24m20s), dentro da variação observada dos runners Windows; não há comparação equivalente que prove ganho nem perda causada pela mudança.
- Ganhos comprovados: confiabilidade (com 45 min, B concluiu em 31 min com sucesso; com 30 min, A e o run #37 foram cancelados) e menos tarefas Kotlin/Java executadas (38 para 0 no Linux em hit).
- Cobertura de testes inalterada: mesmos jobs, mesmos comandos de teste; `test:ci` 3 testes com 100% de cobertura; tooling com as invariantes novas.
- Tokens: nenhuma métrica disponível; nada estimado. Para agentes foram registrados somente tamanhos de arquivos (mapa de contexto).
- Decisão pendente: manter ou reverter `--build-cache` (uma linha em `scripts/build-android.mjs`). Mantido porque não altera resultados, já cacheia compilação Kotlin/Java e custa ≈ 54 MiB de cache no Linux; sem ganho de parede medido. O próximo candidato real é cache de saída nativa (ccache/CMake), não medido.

## Baseline de três execuções bem-sucedidas

A API `GET /repos/{repo}/actions/runs/{id}/jobs` fornece `started_at` e `completed_at` por job e por step; os números abaixo vêm dela. A afirmação anterior de que a API não fornecia horários por job estava incorreta. Duração de parede = `created_at` → `updated_at` do run; "soma dos jobs" = soma das durações dos 7 jobs (runner-minutos observados, sem arredondar por job).

| Run | Parede | Resultado | `windows` | `android` + `emulator` | Soma Linux | Soma Windows | Soma total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [#31](https://github.com/dvmarques/riffando/actions/runs/40522664541) | 17min40s | success | 17m22s | 13m08s + 3m13s | 18m42s | 19m22s | 38m04s |
| [#34](https://github.com/dvmarques/riffando/actions/runs/40529243530) | 25min55s | success | 24m49s | 12m43s + 3m53s | 18m54s | 26m02s | 44m56s |
| [#36](https://github.com/dvmarques/riffando/actions/runs/40563957799) | 29min24s | success | 28m02s | 16m42s + 3m17s | 22m25s | 29m57s | 52m22s |

Média de parede: **24min20s**; mediana: **25min55s**. Média da soma dos jobs: 45m07s. Os tempos de parede incluem agendamento. O job `windows` define o caminho crítico em todas as execuções; nele, `npm run build:android` levou 13m05s, 20m06s e 20m50s (`Build cache is disabled`, 851 de 851 tarefas executadas no run #36). Na `main`, o run [#37](https://github.com/dvmarques/riffando/actions/runs/40568519633) foi cancelado no limite de 30 min do job Windows (com `npm run build:android` ainda em execução após 25m51s) e o gate reprovou. Runs cancelados e Drafts skipped não entram na média.

Etapas medidas em `windows` (run #36): `npm install --global npm@12.2.1` 27 s, `npm ci` 64 s, `test:ci` 29 s, instalação do SDK 65 s, `setup-gradle` 32 s e 118 s no post, `build:android` 1250 s. Em `android` (mesmo run): `build:android` 816 s e prova de compilação 74 s (runs #31 e #34: 636 s e 603 s). Não há métricas de tokens disponíveis nesses runs.
