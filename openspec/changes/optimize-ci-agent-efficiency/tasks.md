# Tarefas

## Diagnóstico

- [ ] Medir baseline de pelo menos três execuções comparáveis (tempo de parede, runner-minutes, cache, sucesso).
- [ ] Mapear gates obrigatórios e proteção de branch; classificar alterações docs, JS, nativas e infraestrutura.
- [ ] Auditar instruções/skills e disponibilidade de métricas de tokens Claude/Codex.

## Implementação (após aprovação)

- [ ] Implementar cache e reduzir instalações/validações redundantes sem perder cobertura.
- [ ] Implementar seleção de CI com fallback seguro e gate agregado, conforme política aprovada.
- [x] Otimizar leitura de contexto, checkpoints e revisões incrementais dos agentes (guia AI_WORKFLOW.md, commit 6be8915).
- [ ] Testar alterações docs-only, JS, nativas, workflow, lockfile e falhas intencionais.
- [ ] Atualizar docs e CHANGELOG; executar npm run validate e validações nativas aplicáveis.

## Verificação

- [ ] Comparar baseline e resultado, registrar limitações e evidências na PR.
- [ ] Revisar diff, validar compatibilidade Claude/Codex e CI do commit final.
