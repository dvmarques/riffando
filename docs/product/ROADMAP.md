# Roadmap e backlog — Riffando

## Fases propostas

| Fase | Semanas exploratórias | Entrega |
|---|---|---|
| 1 | 1–2 | Fundação, design system, banco e qualidade |
| 2 | 3–5 | Teoria, braço interativo e metrônomo |
| 3 | 6–10 | Captura nativa, afinador, exercícios e sessões |
| 4 | 11–16 | Detecção de ataques, calibração, feedback e progresso |
| 5 | 17–21 | Estúdio local, backup, acessibilidade e publicação |

**Dependência crítica:** validar microfone, USB e latência em dispositivo físico logo no início, antes de comprometer a arquitetura do motor de áudio.

## Épicos planejados

- EP-01 — Fundação e qualidade: GC-001 a GC-004.
- EP-02 — Teoria musical: GC-005 a GC-008.
- EP-03 — Metrônomo: GC-009 a GC-012.
- EP-04 — Áudio e afinador: GC-013 a GC-016.
- EP-05 — Exercícios e sessões: GC-017 a GC-020.
- EP-06 — Treinador inteligente: GC-021 a GC-024.
- EP-07 — Progresso: GC-025 a GC-028.
- EP-08 — Estúdio: GC-029 a GC-032.
- EP-09 — Publicação e confiabilidade: GC-033 a GC-036.
- EP-10 — Experiência brasileira: GC-037 a GC-041.

Os códigos GC são **identificadores de planejamento**, não números de issues GitHub.

## Prioridades

- P0: necessário para o escopo essencial e/ou redução de risco.
- P1: importante, mas pode ser entregue após a base.
- P2: aprimoramento.

## Definition of Done

- Critérios de aceite atendidos e documentados.
- Testes automatizados relevantes passando.
- Mudanças de áudio verificadas em aparelho Android físico e entradas aplicáveis.
- UI e feedback em pt-BR, incluindo acessibilidade.
- Persistência/migração e privacidade avaliadas.
- PR revisado, CI validado e documentação atualizada.

## Fluxo de desenvolvimento

Issue → Explore somente leitura → Propose OpenSpec → revisão da proposta → Apply autorizado em branch → testes/Verify → revisão do código → PR → CI → code review → todas as tarefas concluídas → archive/sync autorizado na PR → revisão/validação final e CI → merge autorizado por squash → atualização administrativa da issue. Políticas e gates em [AGENTS.md](../../AGENTS.md); exemplos de comandos em [AI_WORKFLOW](../development/AI_WORKFLOW.md). O projeto **não está autorizado a implementar automaticamente** por esta documentação.

## Licenciamento

Qualquer biblioteca ou contribuição deve ter licença compatível com a PolyForm Noncommercial. A aceitação de contribuições não concede automaticamente direito de relicenciamento comercial; considerar CLA antes de receber contribuições substanciais.
