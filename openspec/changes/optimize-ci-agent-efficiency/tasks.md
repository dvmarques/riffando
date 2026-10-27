# Tarefas

## Diagnóstico

- [x] Medir baseline de pelo menos três execuções comparáveis (tempo de parede, soma de jobs, cache, sucesso): runs #31, #34 e #36 em `design.md`.
- [x] Mapear gates obrigatórios e proteção de branch (sem proteção nem rulesets em 27/10/2026); classificar alterações docs, JS, nativas e infraestrutura (fase 2 permanece proposta).
- [x] Auditar instruções/skills e disponibilidade de métricas de tokens Claude/Codex: não há métrica de tokens exposta no fluxo; registrados somente tamanhos de arquivos.

## Fase 1: implementação (sem mudança de política)

- [x] Habilitar o cache de build do Gradle apenas no CI (`scripts/build-android.mjs`), manter a prova negativa sem cache e reduzir ruído de npm (`ci.yml`), sem alterar jobs, checks nem cobertura.
- [x] Otimizar leitura de contexto, checkpoints e revisões incrementais dos agentes (guia `AI_WORKFLOW.md`, mapa de contexto com lista de não carregar por padrão e consulta direcionada de logs).
- [x] Testar o gate (`skipped`/`cancelled`/`failure`/ausente) e as invariantes do workflow (`tests/tooling/ci-workflow.test.mjs`).
- [x] Atualizar docs e CHANGELOG; executar `npm run validate` e `openspec validate --all --strict --no-interactive`.

## Fase 2: proposta (aguarda aprovação do mantenedor)

- [ ] Selecionar CI por tipo de alteração com fallback completo e gate agregado aceitando `skipped` somente por política aprovada.
- [ ] Testar alterações docs-only, JS, nativas, workflow e lockfile no seletor aprovado.

## Verificação

- [x] Comparar baseline e resultado, registrar limitações e evidências na PR: runs A e B em `design.md`; economia de tempo pendente/não comprovada; run C (Windows com cache quente) registrado na PR.
- [ ] Revisar diff, validar compatibilidade Claude/Codex e CI do commit final.
