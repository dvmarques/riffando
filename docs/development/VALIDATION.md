# Evidências de validação — preparação de IA

Registro de 26/10/2026. O estado atual do PR/CI deve ser consultado no GitHub.

## Escopo e fontes

Lidos README, CONTRIBUTING, LICENSE, TRADEMARKS, contexto, decisões, PRD, roadmap, arquitetura, dados e os corpos das 51 issues existentes. Não havia OpenSpec, AGENTS, app ou CI. Referência principal admin-design-system: AGENTS, CLAUDE, config OpenSpec, árvore de skills/automação e CI; referências complementares: AGENTS de back-admin e leaf-admin. Somente padrões operacionais genéricos foram adaptados.

## Verificações

- `npm run validate`: passou; Markdown sem erros, caminhos de links locais existentes, integrações oficiais reproduzidas com conteúdo idêntico após normalização CRLF/LF, smoke e OpenSpec estrito (1 change validada quanto ao formato).
- `node scripts/setup-openspec.mjs --check`: plano vazio, sem mudanças, notas ou falhas.
- Smoke em diretório temporário: criação da change; templates de proposal/specs/design/tasks; status completo dos artefatos; leitura de tarefa concluída por instructions apply; validação; leitura dos inputs de archive; archive com sincronização e nova validação estrita. Nenhuma change real arquivada.
- CLAUDE.md conferido como referência/importação de AGENTS; sem regras concorrentes.
- `git diff --check`: passou. PRD, arquitetura e modelo de dados preservados; roadmap/contexto atualizados somente quanto ao fluxo operacional.
- Telemetria desativada explicitamente nos wrappers e CI. Uma execução anterior foi bloqueada pela revisão automática por permitir contato com telemetria; o caminho de validação foi corrigido antes da repetição bem-sucedida.

Esses resultados validam ferramentas e artefatos, não execução autenticada dos agentes nem comportamento do aplicativo. Consulte também os checks do commit mais recente.

## Ajuste de organização documental

Em 26/10/2026, o mantenedor aprovou concentrar as políticas em AGENTS.md e as regras OpenSpec em config.yaml. AI_WORKFLOW foi reduzido a tutorial de instalação, comandos e retomada. `npm run validate` e `git diff --check` passaram após o ajuste. A explicação da restrição local de Explore e as regras de sincronização ficaram em AGENTS; a opção skip_specs ficou nas regras da proposta em config.yaml.

Inspeção de referência preservada: admin-design-system develop em `5a7cef16`; não havia template de PR na raiz .github consultada. Os templates do Riffando são próprios.

## Pull Request e CI

- [PR #52](https://github.com/dvmarques/riffando/pull/52), branch `chore/ai-development-setup`, para `main`.
- [CI inicial](https://github.com/dvmarques/riffando/actions/runs/40357593349) passou no commit `9d55745`: checkout, Node 24, npm ci e npm run validate.
- Commits posteriores devem manter o CI verde; consultar os checks atuais do PR. Aprovação humana, merge e archive continuam pendentes.

## Limitações

No ambiente original da preparação não havia executáveis Codex ou Claude Code autenticados. Na revisão complementar no Windows, Claude Code 2.1.304 foi encontrado e sua autenticação confirmada. O resultado da segunda revisão com Claude Code está registrado abaixo; não confundir disponibilidade do CLI com execução de todos os workflows.

Não existe app Expo nem testes/lint/typecheck/build mobile nesta etapa. Sem teste físico de áudio, USB, microfone ou latência. Não alterar status das 41 tarefas.

Templates usam labels padrão existentes; custom labels/milestones estão preparados documentalmente. Proteção de main é recomendação, não foi alterada. A change real não foi arquivada; merge e squash não foram executados.

## Revisão complementar no Windows — 26/10/2026

- A revisão reproduziu falha de `ai:check` em checkout com `core.autocrlf=true`. O comparador agora normaliza somente CRLF/LF; não ignora outras mudanças de conteúdo.
- CI ampliado para Linux e Windows com os mesmos comandos e permissões somente de leitura.
- Markdownlint-cli2 atualizado para 0.24.0; KaTeX transitivo fixado em 0.18.2 por override limitado, com justificativa em design.md. `npm audit`: zero vulnerabilidades após a atualização.
- Adicionado [changelog](../../CHANGELOG.md) em Unreleased. Assignee `dvmarques` e label `documentation` já presentes na PR.
- Nenhum código mobile, merge, squash ou archive da change real realizado. As tarefas de autorização/conclusão após merge permanecem pendentes.

## Segunda revisão com Claude Code — 26/10/2026

- Sessão Claude Code (Opus 5.5) no worktree da PR descobriu as sete skills `openspec-*` de `.claude/skills` e os sete comandos `/opsx:*` de `.claude/commands/opsx`. No primeiro processo, a ferramenta Skill foi negada pela allowlist do executor, não por defeito das integrações. Após incluir Skill na allowlist, uma nova sessão ativou `opsx:verify setup-ai-development` com sucesso e leu status/instructions apply; nenhum bloqueio de permissão ocorreu nessa confirmação. A revisão completa anterior seguiu o procedimento do SKILL.md gerado com o CLI.
- Achado corrigido: em modo não interativo, `init` do OpenSpec 1.15.0 remove prompts legados `opsx-*.md` de `$CODEX_HOME/prompts` ou `~/.codex/prompts`. Reproduzido com `CODEX_HOME` descartável: `npm run validate` (via `ai:check`) apagava o arquivo. Os wrappers agora isolam `CODEX_HOME` e `XDG_DATA_HOME`; `ai:check` falha se um prompt global descartável for removido.
- `ai:check` também falha se a substituição do caminho do CLI no script copiado não ocorrer. `validate-openspec` e o smoke ignoram configuração/schemas pessoais.
- KaTeX 0.18.2: renderização `mathHtml` (inline, display, `\frac`, `\sqrt`), erro de sintaxe e lint markdownlint de documento com matemática validados.
- Com a matriz, os checks passam a se chamar `Documentação e OpenSpec (ubuntu-latest)` e `(windows-latest)`; recomendação de proteção em GITHUB.md ajustada.
- Executados no Windows: `npm run validate`, `node scripts/setup-openspec.mjs --check` (plano vazio) e `npm audit` (0 vulnerabilidades). `npm ci` e consultas `gh` não foram executados nesta sessão; CI remoto da matriz não foi verificado.

## Conferência final pelo Codex

- Instalação limpa `npm ci --ignore-scripts`, seguida de `npm run validate` e `npm audit`: passou, zero vulnerabilidades.
- Regressão em cópias temporárias: integrações LF e CRLF aceitas; alteração real no conteúdo de uma skill rejeitada.
- KaTeX transitivo validado também por renderização inline e display com micromark.
- Sete workflows explicitados no cenário de instalação da spec; nomes dos checks definidos explicitamente pela plataforma no workflow.
- A sessão Codex atual começou no checkout principal antes de existir a configuração; discovery das novas skills nessa mesma sessão não foi testado. Regeneração oficial, execução dos scripts e ativação de skill numa sessão Claude real foram verificadas.

- [CI Linux/Windows da revisão](https://github.com/dvmarques/riffando/actions/runs/40393245594), commit `f950833`: ambos os checks aprovados (Linux 13s, Windows 35s). Tarefas 4.1 a 4.4 concluídas; somente autorização de merge e acompanhamento pós-merge permanecem abertos.
