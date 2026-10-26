# Agentes — Riffando

## Fontes e escopo

Riffando é um aplicativo de aprendizado e prática de guitarra para iniciantes e intermediários, com pt-BR como idioma principal. GitHub é a fonte da verdade: código, documentos, issues, PRs e histórico. Não dependa de conversas ou memória externa.

Após estas regras, use [o mapa de contexto](docs/agent-context-map.md) para leitura seletiva e a skill própria `adaptive-ai-workflow` para classificar o risco (Fast/Standard/Critical). Os guias [modelos](docs/models.md) e [qualidade](docs/quality.md) complementam as políticas sem dispensar validações.

Antes de modificar arquivos, leia `README.md`, `openspec/config.yaml`, a issue e a change pertinente. Consulte `docs/PROJECT_CONTEXT.md`, `docs/DECISIONS.md`, PRD, arquitetura, modelo de dados e roadmap conforme o mapa de contexto e o impacto da tarefa. Em mudanças transversais ou críticas, amplie a leitura das fontes relevantes; nenhuma otimização dispensa regras e gates obrigatórios. O guia rápido `docs/development/AI_WORKFLOW.md` contém instalação, comandos e retomada.

O aplicativo permanece não implementado. A preparação de ferramentas não autoriza iniciar as 41 tarefas GC-001…GC-041. Preserve a distinção entre decisões aprovadas e hipóteses; solicite aprovação antes de mudanças arquiteturais relevantes.

## Stack e organização

- Aprovado: React Native + Expo + TypeScript, Android primeiro e possibilidade de iOS, offline-first e sem servidor/login obrigatório. Expo Router e SQLite são a direção documentada.
- Zustand, Drizzle, Zod, Reanimated, Maestro, DSP C++ e adaptadores Kotlin/Swift são propostas; não trate sua instalação como aprovada automaticamente.
- Hoje há documentação e ferramentas Node de desenvolvimento. Não crie pastas vazias ou um app apenas para reproduzir uma árvore.
- Para GC-001/#11, a arquitetura aprovada para o planejamento é app único na raiz (`app/`, `src/` e `modules/` somente quando necessário), React Native + Expo + TypeScript estrito e Expo Router, com separação UI/domínio/infraestrutura. Não criar packages/workspaces sem necessidade real. Monorepo exige consumidor concreto ou API/versionamento independente comprovado e novo ADR; ver ADR 0001. Essa aprovação e o alinhamento da issue não autorizam implementação, que exige nova solicitação Apply.
- Separe UI/features, domínio puro, persistência e áudio. Reutilize soluções existentes; não adicione padrões web/backend, serviços ou abstrações sem necessidade.
- TypeScript estrito quando criado; evite `any` sem justificativa. Componentes/tipos em PascalCase, funções/variáveis em camelCase, hooks `use*`, diretórios de features e changes em kebab-case; arquivos de rotas seguem Expo Router. Preserve convenções locais predominantes.

## Produto, privacidade e qualidade

- Interface, erros, ensino, feedback, acessibilidade e documentação em pt-BR. Preparar recursos de i18n sem acoplar textos ao domínio; explicar termos musicais e respeitar nomenclatura de cifras.
- Funcionalidade essencial offline, dados locais, migrações versionadas e backup explícito. Não introduza conta, backend, telemetria, upload ou IA generativa como dependência do app.
- Nunca versionar segredos, credenciais, gravações privadas ou dados pessoais. Menor privilégio; permissões solicitadas no contexto, com tratamento de recusa/revogação.
- Testes devem cobrir regras observáveis, limites, domínio musical, persistência/migrações e recuperação. Validar UI com tecnologias assistivas, tamanho de texto, contraste, rótulos, foco, estados e alvos de toque. Não copie testes DOM/ARIA de aplicações web para React Native.
- Áudio: PCM, timestamps monotônicos, DSP e agendamento preciso fora do loop JS; eventos controlados para UI. Expo Go não comprova módulos nativos: usar development builds e Android físico quando aplicável.
- Microfone e USB compatível exigem testes de permissões, troca/remoção de entrada, interrupções/foco, ruído e fallback. Não assumir suporte universal, baixa latência ou precisão sem evidência por aparelho/OS/entrada.
- Treinador inicial monofônico; comunicar confiança insuficiente. Metas de cents/jitter/FPS são exploratórias. Não gravar PCM por padrão; documentar consentimento, retenção e licenças de samples.

## Processo obrigatório

1. Consultar issue, specs permanentes e `npm exec -- openspec list --json`; preservar mudanças locais. Trabalhar em branch ou worktree isolada.
2. **Explore é somente leitura**: não editar arquivos, instalar, gerar artefatos ou executar comandos que alterem estado. Saia de Explore antes de Propose. A skill oficial admite captura de artefatos mediante confirmação; esta restrição local é mais rigorosa e também proíbe essa captura durante Explore.
3. Propose: criar change pequena com proposta, design, deltas e tarefas verificáveis antes da implementação. Seguir os templates oficiais e as regras de artefatos centralizadas em `openspec/config.yaml`.
4. Revisar escopo, critérios, riscos e alternativas. Mudanças arquiteturais exigem aprovação explícita registrada. Não interpretar a geração de proposta como aprovação.
5. Apply somente do escopo autorizado. Atualizar tarefas com evidências e manter artefatos coerentes.
6. Verify: validar contra proposta/specs/tasks, executar `npm run validate` e verificações do app quando existirem. Revisar diff e código antes do PR. Validação sintática OpenSpec não prova comportamento nem aprovação.
7. Abrir PR para `main`, acompanhar CI e corrigir falhas antes de solicitar code review. Relatar limitações reais; nunca afirmar testes não executados.
8. Após revisão e CI verde, conferir que todas as tarefas da change estão realmente concluídas. Com autorização para arquivar, sincronizar specs e arquivar a change na própria branch da PR, antes do merge. Seguir a seção **Conclusão de changes e merge**.
9. Revisar o diff do arquivamento/sincronização, executar novamente as validações e aguardar CI verde no commit final. Com aprovação e autorização de merge, integrar a PR **sempre por squash**. Nunca gravar diretamente na branch de integração.

## Conclusão de changes e merge

- Padrão: **todas as tarefas concluídas → revisão/CI → archive com sync na branch da PR → validação/revisão do diff final e CI → merge por squash**. A branch de integração é `main` neste projeto; usar `develop` apenas quando definida como base do trabalho.
- `tasks.md` contém entregas verificáveis de implementação, testes, revisão e documentação. Aprovação/autorização, executar archive, executar merge e fechamento administrativo de issues são gates/ações do ciclo da PR, registrados no checklist da PR; não criar tarefas que dependam do próprio archive/merge para concluir a change. Não marcar entrega incompleta como feita nem remover critério de aceite real para permitir archive.
- Archive exige 100% das tarefas concluídas, evidências e autorização aplicável. Merge exige aprovação/autorização aplicável e CI verde no commit final, incluindo archive e specs sincronizadas. Reutilizar autorizações já concedidas para o mesmo escopo; a definição deste processo, por si só, não autoriza executar archive ou merge de uma PR específica.
- O CLI archive sincroniza deltas por padrão: não usar `--skip-specs` quando houver deltas nem promover proposta não aprovada ao baseline. Incluir archive e specs sincronizadas na mesma PR, de modo que o squash entregue implementação e documentação juntas.
- **Exceção somente por restrição concreta:** quando uma entrega/validação precisa estar em `main` ou `develop` antes de concluir a change (por exemplo, validação disponível apenas após integração), registrar na PR e no design a restrição, evidência, tarefas dependentes, branch de destino e sequência alternativa. Obter aprovação da exceção antes de integrar; conveniência não é justificativa. Preservar as tarefas dependentes abertas até sua execução real.
- Na exceção, integrar por squash com a change ativa, executar e validar o trabalho dependente, concluir todas as tarefas e só então sincronizar/arquivar em PR de acompanhamento, também integrada por squash. A exceção altera a ordem entre integração e archive; nunca dispensa tarefas completas antes de archive nem autoriza merge commit ou rebase merge.

## Git, CI e conclusão

- Branches `chore/<issue>-<descricao>`, `feat/...`, `fix/...`, `docs/...`; commits Conventional Commits (`chore:`, `feat:`, `fix:`, `docs:`, `test:`). Não misturar refatorações fora do escopo.
- PR deve conter issue/change, problema e resultado, limites, testes, riscos, privacidade/acessibilidade e evidência de aparelho quando aplicável. Use `Closes #N` somente para escopo integralmente entregue; caso parcial, `Refs #N`.
- Nesta fase, `npm run validate` verifica Markdown, links locais, integrações geradas, smoke do CLI e OpenSpec estrito. Não há lint/typecheck/test/build mobile. Ao criar código, adicionar scripts reais, testes relevantes e gates obrigatórios no CI; não substituir verificações por comandos que apenas retornam sucesso.
- Concluir implementação somente com critérios atendidos, revisão de código, CI verde e documentação atualizada. Archive e merge seguem a ordem e os gates da seção **Conclusão de changes e merge**; merge sempre por squash.
- Toda mudança relevante de produto, fluxo de desenvolvimento ou documentação deve ser registrada em `CHANGELOG.md`, na única seção `### [X.Y.Z] - Em andamento`, sob `#### Added`, `#### Changed` ou `#### Fixed`. Identificar a change OpenSpec ou issue e descrever objetivamente o efeito; justificar na PR quando não houver mudança registrável. A seção atual é `[0.0.1] - Em andamento`, placeholder do próximo patch após `0.0.0`, sem representar release publicada.
- No fechamento autorizado de uma versão, substituir `Em andamento` pela data civil de `America/Sao_Paulo` em `dd-mmm-aaaa` (jan, fev, mar, abr, mai, jun, jul, ago, set, out, nov, dez), manter versões em ordem decrescente e abrir o próximo patch como placeholder em andamento. Esse placeholder pode ser renomeado para minor/major na preparação, preservando as entradas; não alterar manifests nem publicar release apenas para registrar mudanças.
- Ao mudar decisões, atualizar contexto, registro de decisões, documentos afetados e ADR quando estrutural. Não duplicar PRD/arquitetura em instruções operacionais.

## Agentes e dependências

`AGENTS.md` é a fonte operacional comum. `CLAUDE.md` só referencia este arquivo. Skills/comandos OpenSpec são gerados pelo CLI: não editar manualmente. `npm run ai:setup` instala as integrações; `npm run ai:update` as regenera com perfil reproduzível. Codex usa `.agents/skills`; Claude usa `.claude/skills` e `.claude/commands/opsx`. Skills próprias (hoje `adaptive-ai-workflow`) têm fonte em `.agents/skills`; após alterá-la, rode `npm run sync:agent-skills` para copiá-la a `.claude/skills` (cópia, não symlink, por causa do Windows) e `npm run check:agent-skills` valida a sincronia; `ai:check` as ignora ao comparar com as integrações oficiais. Revisores consultivos do Claude ficam em `.claude/agents`. Não duplicar skills em `.codex` nem adicionar permissões irrestritas, hooks ou MCPs desnecessários.

Dependências devem ter necessidade, versão/lockfile e licença avaliados. Preserve [PolyForm Noncommercial 1.0.0](LICENSE), [TRADEMARKS](TRADEMARKS.md) e condições de contribuição: source-available, não open source OSI; contribuições não concedem automaticamente direito de relicenciamento comercial. Não alterar licença, segurança, proteção de branches ou publicar releases sem aprovação apropriada.
