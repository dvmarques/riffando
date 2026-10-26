# Evidências de validação — preparação de IA

Registro de 26/10/2026. O estado atual do PR/CI deve ser consultado no GitHub.

## Escopo e fontes

Lidos README, CONTRIBUTING, LICENSE, TRADEMARKS, contexto, decisões, PRD, roadmap, arquitetura, dados e os corpos das 51 issues existentes. Não havia OpenSpec, AGENTS, app ou CI. Referência principal admin-design-system: AGENTS, CLAUDE, config OpenSpec, árvore de skills/automação e CI; referências complementares: AGENTS de back-admin e leaf-admin. Somente padrões operacionais genéricos foram adaptados.

## Verificações

- `npm run validate`: passou; Markdown sem erros, caminhos de links locais existentes, integrações oficiais reproduzidas byte a byte, smoke e OpenSpec estrito (1 change validada quanto ao formato).
- `node scripts/setup-openspec.mjs --check`: plano vazio, sem mudanças, notas ou falhas.
- Smoke em diretório temporário: criação da change; templates de proposal/specs/design/tasks; status completo dos artefatos; leitura de tarefa concluída por instructions apply; validação; leitura dos inputs de archive; archive com sincronização e nova validação estrita. Nenhuma change real arquivada.
- CLAUDE.md conferido como referência/importação de AGENTS; sem regras concorrentes.
- `git diff --check`: passou. PRD, arquitetura e modelo de dados preservados; roadmap/contexto atualizados somente quanto ao fluxo operacional.
- Telemetria desativada explicitamente nos wrappers e CI. Uma execução anterior foi bloqueada pela revisão automática por permitir contato com telemetria; o caminho de validação foi corrigido antes da repetição bem-sucedida.

Esses resultados validam ferramentas e artefatos, não execução autenticada dos agentes nem comportamento do aplicativo. Consulte também os checks do commit mais recente.

## Pull Request e CI

- [PR #52](https://github.com/dvmarques/riffando/pull/52), branch `chore/ai-development-setup`, para `main`.
- [CI inicial](https://github.com/dvmarques/riffando/actions/runs/40357593349) passou no commit `9d55745`: checkout, Node 24, npm ci e npm run validate.
- Commits posteriores devem manter o CI verde; consultar os checks atuais do PR. Aprovação humana, merge e archive continuam pendentes.

## Limitações

Não há executáveis Codex ou Claude Code neste ambiente, nem sessões autenticadas desses agentes. Discovery/interpretação das instruções e execução ponta a ponta das skills precisam de confirmação nas sessões reais; arquivos oficiais e CLI podem ser verificados independentemente.

Não existe app Expo nem testes/lint/typecheck/build mobile nesta etapa. Sem teste físico de áudio, USB, microfone ou latência. Não alterar status das 41 tarefas.

Templates usam labels padrão existentes; custom labels/milestones estão preparados documentalmente. Proteção de main é recomendação, não foi alterada. A change real não foi arquivada; merge e squash não foram executados.
