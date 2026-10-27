# Contexto mestre do projeto Riffando

> **Leia este documento primeiro ao retomar o projeto em outra conversa, IDE ou agente.** Fonte de verdade: este repositório e suas issues; conversas anteriores não são necessárias. Atualize este arquivo quando uma decisão relevante mudar.

## Identidade e objetivo

- **Nome:** Riffando (nome de trabalho, disponibilidade de marca/domínio/lojas ainda não confirmada oficialmente).
- **Slogan proposto:** “Toque. Aprenda. Evolua.”
- **Proposta:** app móvel de aprendizado e prática de guitarra, com afinador, metrônomo, braço interativo, exercícios, treinador de notas/ritmo e evolução pessoal.
- **Público:** guitarristas iniciantes e intermediários, com foco no Brasil.
- **Diferencial central:** produto pensado originalmente em **português brasileiro (pt-BR)**, inclusive ensino, feedback, nomenclatura, glossário e acessibilidade — não apenas tradução.
- **Visual proposto, ainda não aprovado como definitivo:** grafite #101820, verde menta #5EE0B5, branco #F5F7F8, âmbar #F4B860 e coral #F07878; visual moderno, musical e tecnológico, preferencialmente escuro com suporte a tema claro. Não há logo definitivo.
- **Tom de voz:** didático, motivador, preciso e acessível; evitar feedback punitivo ou certeza falsa.

## Decisões de produto já tomadas

1. Android primeiro; **preservar possibilidade de iOS** com máximo reaproveitamento de código.
2. **React Native + Expo + TypeScript**, não Flutter, aproveitando familiaridade com ecossistema TS.
3. **Offline-first**: sem servidor obrigatório, login, sincronização em nuvem ou IA paga/generativa.
4. **Sem custos recorrentes de infraestrutura** como requisito de arquitetura; taxas eventuais de publicação e ferramentas devem ser avaliadas separadamente.
5. **Duas entradas de áudio:** microfone do celular e interface de áudio USB quando suportada; começar validando microfone, mas não abandonar USB.
6. Análise inicial **monofônica**, com pontuação de afinação, ritmo e estabilidade baseada em sinais reais e confiança.
7. Aplicativo ambicioso, porém **entrega incremental em fases**.
8. Dados de prática e áudio mantidos localmente; backup/exportação previstos.
9. Não assumir suporte universal a USB, baixa latência ou precisão sem testes em dispositivos reais.
10. **Ainda não foi autorizada implementação de funcionalidades** por estas decisões; a fase atual é organização/refinamento. Quando houver pedido explícito para começar, seguir o backlog.

## Situação verificada em 26/10/2026

- Repositório público: [dvmarques/riffando](https://github.com/dvmarques/riffando)
- Branch padrão: `main`.
- Licença vigente no arquivo `LICENSE`: **PolyForm Noncommercial 1.0.0**, com uso não comercial; é **source-available**, não open source OSI.
- Antes havia MIT no histórico; a troca não revoga permissões já concedidas sobre versões anteriores.
- `README.md`, `CONTRIBUTING.md` e `TRADEMARKS.md` criados.
- Documentos de produto, arquitetura, dados e roadmap criados.
- **10 épicos** GitHub (#1–#10) e **41 issues técnicas** (#11–#51) criados; nenhuma funcionalidade implementada.
- **Não há ainda** GitHub Project visual, milestones confirmados, labels personalizados, código React Native ou builds. A preparação de IA adiciona CI de documentação e ferramentas; não tratar planejamento como entrega.

## Referências obrigatórias para retomada

- [PRD](product/PRD.md) — requisitos e escopo.
- [Roadmap](product/ROADMAP.md) — fases e backlog.
- [Arquitetura](architecture/ARCHITECTURE.md) — decisões e riscos técnicos.
- [Modelo de dados](architecture/DATA_MODEL.md) — SQLite e regras.
- [Decisões e pendências](DECISIONS.md) — confirmado versus proposto.
- [Issues](https://github.com/dvmarques/riffando/issues) — execução e acompanhamento.
- [Licença](../LICENSE), [contribuições](../CONTRIBUTING.md) e [marca](../TRADEMARKS.md).

## Sequência recomendada para continuar

1. Revisar documentos e issues; resolver inconsistências e detalhar dependências.
2. Configurar labels, milestones e GitHub Project se solicitado e viável.
3. Refinar a **prova de conceito técnica de áudio**: captura PCM, timestamps, roteamento USB, detecção de pitch e jitter do metrônomo em Android real.
4. Revisar riscos de licenças de bibliotecas e direitos sobre contribuições antes de aceitar código de terceiros.
5. Com aprovação para implementação, iniciar fundação Expo/TypeScript e validação técnica de áudio antecipada; não esperar até o fim da fase 3 para testar o risco principal.
6. Atualizar documentação, ADRs, critérios de aceite e status das issues a cada decisão/entrega.

## Cuidados ao trabalhar com assistentes

- **Não inventar status** de builds, testes, funcionalidades ou disponibilidade de marca.
- Não publicar segredos, dados pessoais, gravações privadas ou credenciais no repositório público.
- Antes de alterar código, consultar issues existentes, arquitetura e licença; trabalhar com PR e validação.
- Se uma decisão nova surgir em conversa, **registrá-la neste repositório** antes de depender dela para trabalho futuro.
- Não depender de Notion, mensagens anteriores ou memória de chat como única fonte do projeto.
- Se uma proposta ainda não estiver aprovada, registrá-la como **proposta**, não decisão definitiva.

## Próxima decisão técnica mais importante

Escolher um spike de áudio Android que valide: microfone, interface USB (em dispositivos compatíveis), sincronização de timestamps, estabilidade de pitch monofônico e latência de clique. Seus resultados podem alterar a arquitetura C++/Expo Modules proposta.

## Preparação de desenvolvimento com IA — 26/10/2026

Configuração da [PR #52](https://github.com/dvmarques/riffando/pull/52), aprovada pelo mantenedor em 26/10/2026. A change [setup-ai-development](../openspec/changes/archive/2026-10-26-setup-ai-development/proposal.md) foi arquivada com 18/18 tarefas concluídas e a spec sincronizada antes do squash; consultar no GitHub o estado da integração. Nenhuma das 41 tarefas funcionais foi implementada ou encerrada.

- [AGENTS.md](../AGENTS.md) é a instrução operacional comum; CLAUDE apenas referencia/importa esse arquivo.
- [AI_WORKFLOW](development/AI_WORKFLOW.md) contém instalação, comandos Codex/Claude e retomada; políticas e gates ficam em AGENTS.md, e regras OpenSpec em config.yaml.
- OpenSpec 1.15.0 fixado no manifest/lock; sete workflows oficiais, incluindo verify.
- [Validação](development/VALIDATION.md) registra evidências e limites; [GitHub](development/GITHUB.md) documenta templates, taxonomia e proteção recomendada.
- CI valida documentação e ferramentas. Sem código mobile, lint/typecheck/test/build do app continuam pendentes de #11/#14.
- A preparação deixou a topologia para #11. No refinamento de 26/10/2026, o mantenedor aprovou app único na raiz para o planejamento, sem packages/workspaces desnecessários; ver ADR 0001. Implementação continua sem autorização.
- Fluxo: Issue → Explore somente leitura → Propose → revisão → Apply → Verify → revisão de código → PR → CI → code review → todas as tarefas concluídas → archive/sync autorizado na PR → revisão/validação final e CI → merge autorizado por squash.
- Archive e merge dependem de autorização aplicável; somente restrição concreta de integração prévia permite alterar a ordem, conforme AGENTS.md. Nesta preparação, o archive já foi autorizado e executado antes do squash.

## Fundação mobile — planejamento refinado em 26/10/2026

O mantenedor aprovou app único na raiz com React Native + Expo + TypeScript estrito, Expo Router e separação UI/domínio/infraestrutura e autorizou alinhar a issue #11. A change [define-mobile-foundation](../openspec/changes/define-mobile-foundation/proposal.md), o [ADR 0001](adr/0001-mobile-foundation.md) e a [issue #11](https://github.com/dvmarques/riffando/issues/11) compartilham escopo/exclusões e CA-01…CA-06. Monorepo futuro depende de consumidor concreto ou API/versionamento independente comprovado e novo ADR.

A [PR #53](https://github.com/dvmarques/riffando/pull/53) permanece aberta para revisão da especificação: diagnóstico Windows/Linux, gates de CI e estados de loading foram detalhados. Seleção exata de SDK/toolchain e dependências/licenças fica para implementação autorizada. Nenhuma tarefa de implementação concluída, dependência mobile instalada, código, workflow ou branch protection alterado nesta revisão. Aprovação arquitetural não autoriza Apply, archive/sync ou merge.

## Estado do Apply — 26/10/2026

Após aprovação do plano e autorização separada do mantenedor, GC-001 entrou em implementação na PR #53. Shell de início/informações, recuperação pt-BR, TS estrito, testes, diagnóstico e CI foram adicionados. Resultados e pendências atuais em [guia mobile](development/MOBILE.md). Esta atualização supera as referências históricas acima a implementação não autorizada/não existente; não indica app completo. Somente tarefas verificadas são concluídas. Demais funcionalidades, inventário final/licenças, risco de transitivas e validação Android/acessibilidade permanecem fora de qualquer declaração de conclusão. Sem archive/merge.

## Fundação verificada — 27/10/2026

As 20 tarefas de GC-001 foram verificadas na branch da PR #53: builds Windows/Linux e sete checks do run 40522664541 aprovados no head a556c82; smoke Android offline, fonte 200% e TalkBack manual confirmados. Evidências, matriz, riscos e limites em [guia mobile](development/MOBILE.md). Esse registro supera as pendências históricas de shell/build/acessibilidade acima. O aceite de vulnerabilidades é temporário e restrito ao tooling; nenhuma funcionalidade musical, publicação de loja, archive/sync ou merge foi realizada. Alterações documentais posteriores exigem CI do commit final e os gates de autorização permanecem.
