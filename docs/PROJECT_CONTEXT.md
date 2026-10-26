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

Configuração proposta na branch `chore/ai-development-setup`, change `setup-ai-development`; aprovação e merge devem ser confirmados no GitHub. Nenhuma das 41 tarefas funcionais foi implementada ou encerrada.

- [AGENTS.md](../AGENTS.md) é a instrução operacional comum; CLAUDE apenas referencia/importa esse arquivo.
- [AI_WORKFLOW](development/AI_WORKFLOW.md) contém instalação, comandos Codex/Claude e retomada; políticas e gates ficam em AGENTS.md, e regras OpenSpec em config.yaml.
- OpenSpec 1.15.0 fixado no manifest/lock; sete workflows oficiais, incluindo verify.
- [Validação](development/VALIDATION.md) registra evidências e limites; [GitHub](development/GITHUB.md) documenta templates, taxonomia e proteção recomendada.
- CI valida documentação e ferramentas. Sem código mobile, lint/typecheck/test/build do app continuam pendentes de #11/#14.
- A organização `apps/mobile` + `packages` permanece proposta. Avaliar app único versus monorepo no refinamento da issue #11 antes de criar a base.
- Fluxo: Issue → Explore somente leitura → Propose → revisão → Apply → Verify → revisão de código → PR → CI → code review → todas as tarefas concluídas → archive/sync autorizado na PR → revisão/validação final e CI → merge autorizado por squash.
- Archive e merge dependem de autorização aplicável; somente restrição concreta de integração prévia permite alterar a ordem, conforme AGENTS.md. A change permanece ativa enquanto seu arquivamento não for autorizado/executado.
