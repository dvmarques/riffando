# Agentes — Riffando

## Fontes e escopo

Riffando é um aplicativo de aprendizado e prática de guitarra para iniciantes e intermediários, com pt-BR como idioma principal. GitHub é a fonte da verdade: código, documentos, issues, PRs e histórico. Não dependa de conversas ou memória externa.

Antes de modificar arquivos, leia [README](README.md), [contexto mestre](docs/PROJECT_CONTEXT.md), [decisões](docs/DECISIONS.md), [PRD](docs/product/PRD.md), [arquitetura](docs/architecture/ARCHITECTURE.md), [modelo de dados](docs/architecture/DATA_MODEL.md), [roadmap](docs/product/ROADMAP.md), a issue e as specs/changes pertinentes. Consulte [AI_WORKFLOW](docs/development/AI_WORKFLOW.md) e `openspec/config.yaml` para execução.

O aplicativo permanece não implementado. A preparação de ferramentas não autoriza iniciar as 41 tarefas GC-001…GC-041. Preserve a distinção entre decisões aprovadas e hipóteses; solicite aprovação antes de mudanças arquiteturais relevantes.

## Stack e organização

- Aprovado: React Native + Expo + TypeScript, Android primeiro e possibilidade de iOS, offline-first e sem servidor/login obrigatório. Expo Router e SQLite são a direção documentada.
- Zustand, Drizzle, Zod, Reanimated, Maestro, DSP C++ e adaptadores Kotlin/Swift são propostas; não trate sua instalação como aprovada automaticamente.
- Hoje há documentação e ferramentas Node de desenvolvimento. Não crie pastas vazias ou um app apenas para reproduzir uma árvore.
- Na fundação futura, avalie app único (`app/`, `src/`, `modules/`) versus `apps/mobile` e `packages`. A issue #11 ainda pede monorepo; resolva essa divergência por proposta antes de implementá-la. Extraia pacotes somente quando houver fronteira e benefício verificáveis.
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
2. **Explore é somente leitura**: não editar arquivos, instalar, gerar artefatos ou executar comandos que alterem estado. Saia de Explore antes de Propose.
3. Propose: criar change pequena com proposta, design, deltas e tarefas verificáveis antes da implementação. Referenciar issue GitHub e identificador GC quando houver. Usar templates oficiais e regras centrais; texto pt-BR e marcadores `Requirement`, `Scenario`, `WHEN`, `THEN`, `MUST`/`SHALL` em inglês.
4. Revisar escopo, critérios, riscos e alternativas. Mudanças arquiteturais exigem aprovação explícita registrada. Não interpretar a geração de proposta como aprovação.
5. Apply somente do escopo autorizado. Atualizar tarefas com evidências e manter artefatos coerentes.
6. Verify: validar contra proposta/specs/tasks, executar `npm run validate` e verificações do app quando existirem. Revisar diff e código antes do PR. Validação sintática OpenSpec não prova comportamento nem aprovação.
7. Abrir PR para `main`, acompanhar CI e corrigir falhas antes de solicitar code review. Relatar limitações reais; nunca afirmar testes não executados.
8. Aguardar aprovação. **Não fazer merge, squash ou archive sem autorização explícita.** Após merge autorizado, atualizar issue, arquivar e sincronizar specs em branch/PR de acompanhamento autorizado; nunca gravar direto em `main`.

## Git, CI e conclusão

- Branches `chore/<issue>-<descricao>`, `feat/...`, `fix/...`, `docs/...`; commits Conventional Commits (`chore:`, `feat:`, `fix:`, `docs:`, `test:`). Não misturar refatorações fora do escopo.
- PR deve conter issue/change, problema e resultado, limites, testes, riscos, privacidade/acessibilidade e evidência de aparelho quando aplicável. Use `Closes #N` somente para escopo integralmente entregue; caso parcial, `Refs #N`.
- Nesta fase, `npm run validate` verifica Markdown, links locais, integrações geradas, smoke do CLI e OpenSpec estrito. Não há lint/typecheck/test/build mobile. Ao criar código, adicionar scripts reais, testes relevantes e gates obrigatórios no CI; não substituir verificações por comandos que apenas retornam sucesso.
- Concluir implementação somente com critérios atendidos, revisão de código, CI verde e documentação atualizada. Merge e archive são etapas separadas, dependentes de autorização.
- Ao mudar decisões, atualizar contexto, registro de decisões, documentos afetados e ADR quando estrutural. Não duplicar PRD/arquitetura em instruções operacionais.

## Agentes e dependências

`AGENTS.md` é a fonte operacional comum. `CLAUDE.md` só referencia este arquivo. Skills/comandos OpenSpec são gerados pelo CLI: não editar manualmente. `npm run ai:setup` instala as integrações; `npm run ai:update` as regenera com perfil reproduzível. Codex usa `.agents/skills`; Claude usa `.claude/skills` e `.claude/commands/opsx`. Não duplicar skills em `.codex` nem adicionar permissões irrestritas, hooks ou MCPs desnecessários.

Dependências devem ter necessidade, versão/lockfile e licença avaliados. Preserve [PolyForm Noncommercial 1.0.0](LICENSE), [TRADEMARKS](TRADEMARKS.md) e condições de contribuição: source-available, não open source OSI; contribuições não concedem automaticamente direito de relicenciamento comercial. Não alterar licença, segurança, proteção de branches ou publicar releases sem aprovação apropriada.
