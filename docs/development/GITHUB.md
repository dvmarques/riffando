# GitHub — qualidade e planejamento

## Estado e taxonomia preparada

Em 26/10/2026, foram lidas as 51 issues existentes (10 épicos e 41 tarefas). Não alterar seu estado por configurar ferramentas. A consulta pública de labels identificou `bug`, `enhancement`, `documentation`, `accessibility` e outros padrões do GitHub. Os templates usam somente labels existentes. Tarefa técnica fica sem label automático para evitar criar classificação desnecessária.

Não há milestones registrados no contexto inicial; a API de milestones não está disponível pelo conector utilizado. Preparação sugerida, sem datas ou aplicação automática:

| Milestone proposto | Escopo do roadmap |
|---|---|
| Fase 1 — Fundação e qualidade | GC-001…004 |
| Fase 2 — Ferramentas musicais | GC-005…012 |
| Fase 3 — Áudio e sessões | GC-013…020 |
| Fase 4 — Treinador e progresso | GC-021…028 |
| Fase 5 — Estúdio e lançamento | GC-029…036 |

GC-037…041 são transversais: atribuir milestone pela entrega concreta, sem duplicar issues. P0/P1/P2 permanecem prioridades no corpo existente; custom labels e milestones podem ser criados posteriormente por mantenedor com acesso administrativo. Não foram aplicados em massa neste setup.

## Proteção recomendada de main

Preparar ruleset com PR obrigatório, uma aprovação independente quando disponível, resolução de conversas, status obrigatórios da matriz `Documentação e OpenSpec (ubuntu-latest)` e `Documentação e OpenSpec (windows-latest)` e bloqueio de force push/exclusão. Descartar aprovações antigas após alterações relevantes e limitar bypass. Confirmar os nomes exatos dos checks após a primeira execução da matriz.

Esta é recomendação, não configuração aplicada. Verificar permissões administrativas, plano GitHub, colaboradores capazes de revisar e impactos antes de ativar: exigir aprovador independente pode bloquear mantenedor único. Não usar aprovação automática por IA nem auto-merge como substituto.

## CI e PRs Draft

Enquanto a PR estiver em **Draft**, o job de validação do CI fica skipped. Ao marcar **Ready for review**, o evento `ready_for_review` executa a validação completa (Linux e Windows) sobre o commit corrente. `push` na `main` e execução manual (`workflow_dispatch`) continuam rodando normalmente; para medir ou diagnosticar o CI completo de uma branch Draft sem marcar Ready, use `gh workflow run ci.yml --ref <branch>`. A execução manual não substitui o CI do PR exigido para integração. Em Draft, rode `npm run validate` localmente; a integração exige CI verde no commit final, portanto a PR precisa estar Ready.

## Runtime das actions (Node.js 20 → 24)

O aviso "Node.js 20 is deprecated" refere-se ao runtime **interno** das actions (`runs.using` em `action.yml`), não ao Node instalado por `actions/setup-node` (mantido em 24.21.0 com npm 12.2.1). Em 28/10/2026, `android-actions/setup-android@v3`, `actions/upload-artifact@v4` e `actions/download-artifact@v4` declaravam `node20`; foram atualizadas para `setup-android@v4`, `upload-artifact@v7` e `download-artifact@v8` (`node24`). `checkout@v6`, `setup-node@v6`, `setup-java@v5`, `gradle/actions/setup-gradle@v5` e `reactivecircus/android-emulator-runner@v2` já usam `node24`. `tests/tooling/ci-workflow.test.mjs` impede o retorno dos majors `node20` conhecidos. Runners GitHub-hosted Linux/Windows atendem ao Node 24 das actions; ao revisar versões, consultar o `action.yml` do ref escolhido.

## Cache de build e custo do CI

No CI (`CI=true`, como no GitHub Actions) `npm run build:android` passa `--build-cache` ao Gradle; localmente o cache de build não é usado. `gradle/actions/setup-gradle` persiste o cache entre execuções. Um PR lê somente caches da própria referência e da `main`; a primeira execução após uma mudança de entradas compila tudo (cache *miss*) e as seguintes reaproveitam as tarefas inalteradas. A prova negativa de compilação Kotlin não usa cache de build. O tempo de parede do CI é o do job `windows`; durações por job e step saem de `gh api repos/dvmarques/riffando/actions/runs/<id>/jobs`. O repositório é público e a `main` não tem proteção de branch nem rulesets (verificado em 27/10/2026); exigir o check `Fundação — gate agregado` e qualquer mudança de frequência dos builds seguem como proposta em [design da change](../../openspec/changes/archive/2026-10-27-optimize-ci-agent-efficiency/design.md), não aplicada.

## Evolução do CI mobile

O workflow inicial executa `npm ci --ignore-scripts` e `npm run validate` em Linux e Windows, sem credenciais nem permissões de escrita. Não possui scripts fictícios de Expo/TypeScript.

Em #11/#14, após escopo aprovado, adicionar TypeScript estrito, lint React Native, testes de domínio/UI/migração e build Android reproduzível. Avaliar SDK/JDK, development builds e cache conforme o Expo escolhido. Maestro e demais propostas exigem validação. Não colocar segredos EAS/loja em PRs de forks; publicar exige fluxo e autorização próprios.

## Conclusão da PR

A seção **Conclusão de changes e merge** de [AGENTS.md](../../AGENTS.md) define o fluxo: tasks completas, archive/sync na própria PR, revisão/CI final e squash merge. O template registra os gates e eventual exceção por restrição concreta de integração prévia. Não exigir uma tarefa de executar o merge ou de fechar administrativamente a issue dentro da change. Configurações administrativas do repositório não foram alteradas; a regra de usar squash aplica-se à execução do merge.
