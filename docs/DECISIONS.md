# Registro de decisões e questões abertas

Este arquivo distingue **decisões aprovadas**, **propostas técnicas** e **pendências**. Atualizar com data e links para issues/PRs/ADRs.

## Aprovadas

| Tema | Decisão | Motivação |
|---|---|---|
| Público | Iniciantes e intermediários | Ensino progressivo e treinamento |
| Idioma | pt-BR primeiro; preparar i18n | Diferenciação no mercado brasileiro |
| Plataformas | Android primeiro, iOS depois se viável | Publicação incremental |
| Framework | React Native + Expo + TypeScript | Reuso de conhecimento e código |
| Modelo de operação | Offline-first, sem backend/login obrigatório | Privacidade e custo recorrente zero de infraestrutura |
| Entradas | Microfone e USB quando compatível | Flexibilidade de prática |
| Entrega | Produto completo em fases | Redução de risco |
| Licença atual | PolyForm Noncommercial 1.0.0 | Permitir estudo/forks não comerciais e restringir exploração comercial |

## Propostas sujeitas a validação

| Tema | Proposta | Validação necessária |
|---|---|---|
| DSP | Núcleo C++ com adaptadores Kotlin/Swift e Expo Modules | Spike Android, custo de manutenção e portabilidade |
| Pitch | YIN/pYIN ou alternativa | Precisão, ruído, CPU e latência |
| Estado | Zustand | Necessidade real após protótipo |
| Banco | SQLite + migrações; avaliar Drizzle | Prova de esquema, testes e backups |
| Testes E2E | Maestro | Compatibilidade com Expo/dev builds |
| Scoring | Exemplo inicial: 50% afinação, 35% ritmo, 15% estabilidade | Não adotar como regra até calibração com músicos e dados |
| UI | Grafite/menta, tema escuro com claro | Protótipos e testes de acessibilidade |
| Performance | 60 FPS, inicialização <=2 s, afinador ±5 cents em sinal limpo, jitter <5 ms | Medir em aparelhos de referência |

## Pendências

- Verificação formal do nome Riffando em INPI, lojas e domínios; sem garantia de disponibilidade.
- Definir identidade visual definitiva, ícone e assets.
- Validar suporte real a USB Audio e microfone em matriz de Android.
- Definir formatos de áudio, política de retenção de eventos e backups.
- Avaliar compatibilidade de licenças das dependências e autorização de contribuições para eventual licença comercial (CLA).
- Criar GitHub Project, milestones, labels e relações de dependência.
- Determinar critérios objetivos para MVP e publicação.
- Decidir quando iniciar a implementação; **não iniciada**.

## Como registrar uma nova decisão

Documentar: data, contexto, alternativas, decisão, consequências, evidências de teste, issue/PR associado. Criar ADR em `docs/adr/` para mudanças estruturais de arquitetura.

## Preparação operacional de IA — 26/10/2026

Escopo solicitado: OpenSpec, Codex, Claude Code, documentação, templates e CI, entregue por PR sem merge. A change `setup-ai-development` registra a preparação e aguarda aprovação humana no GitHub. OpenSpec 1.15.0 fixado; AGENTS central; CLAUDE somente referência/importação. Ver [guia](development/AI_WORKFLOW.md).

Nenhuma proposta de stack do aplicativo foi promovida a decisão aprovada. A estrutura monorepo de #11 e da arquitetura deve ser comparada com app único antes de implementar; não criar workspaces nesta etapa. Merge, squash e archive exigem autorização explícita.

## Conclusão de changes e squash — 26/10/2026

O mantenedor definiu o padrão: todas as tarefas concluídas → archive/sync na branch da PR → revisão/validação final e CI → merge sempre por squash. Autorizações e ações do ciclo da PR ficam no checklist da PR, sem tarefas circulares na change. Entregas reais permanecem em tasks.md até sua conclusão comprovada.

Somente restrição concreta que exija implementação em main/develop antes de concluir a change permite inverter integração e archive. Registrar evidência, tarefas dependentes, destino, sequência e aprovação da exceção. Na exceção, concluir todas as tarefas após a integração e arquivar em PR de acompanhamento; todo merge continua por squash. Políticas canônicas em AGENTS.md. Esta decisão define o processo; não executa nem autoriza automaticamente archive/merge da PR #52.

## Conclusão autorizada da preparação — 26/10/2026

O mantenedor aprovou a PR #52 e autorizou explicitamente archive antes do squash. Change setup-ai-development arquivada em openspec/changes/archive/2026-10-26-setup-ai-development com 18/18 tarefas concluídas; quatro requisitos sincronizados na spec ai-development-workflow. Aplicado o fluxo padrão, sem exceção de integração prévia. A autorização abrange o squash após validação e CI do commit final. Nenhuma das 41 tarefas GC foi implementada ou encerrada.
