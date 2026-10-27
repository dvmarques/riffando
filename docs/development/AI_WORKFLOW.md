# Guia rápido — desenvolvimento com IA

As políticas de trabalho estão em [AGENTS.md](../../AGENTS.md). O contexto, as regras dos artefatos e as orientações das operações OpenSpec ficam em [config.yaml](../../openspec/config.yaml). Este guia reúne apenas instalação, exemplos de comandos e retomada.

## Instalar e atualizar

Pré-requisitos: Git, Node.js 24 (`.nvmrc`), npm e Codex CLI/IDE ou Claude Code instalado e autenticado pelo desenvolvedor. OpenSpec **1.15.0** está fixado no manifest/lock; a fundação Expo está implementada; comandos mobile e versões exatas em [MOBILE.md](MOBILE.md).

```bash
npm ci --ignore-scripts
npm run ai:setup
npm run validate
```

As integrações já estão versionadas. `ai:setup` executa a inicialização oficial para `codex,claude`, com perfil custom e delivery both em diretórios temporários de configuração/dados (`XDG_CONFIG_HOME`, `XDG_DATA_HOME`) e `CODEX_HOME`, sem alterar preferências globais nem remover prompts Codex pessoais em `~/.codex/prompts`. Telemetria fica desativada nos wrappers e CI. Para CLI avulso: `OPENSPEC_TELEMETRY=0` (PowerShell: `$env:OPENSPEC_TELEMETRY='0'`).

Para atualizar a versão aprovada:

```bash
npm install --save-dev --save-exact --ignore-scripts @fission-ai/openspec@<versao-aprovada>
npm run ai:update
npm run validate
```

`ai:update` regenera as integrações com o CLI oficial. `node scripts/setup-openspec.mjs --check` mostra o plano sem gravar no projeto. Os templates vêm do schema oficial `spec-driven`; `npm exec -- openspec templates --json` mostra seus caminhos.

## Usar os agentes

Inicie na raiz e reinicie a sessão após regenerar integrações. Codex encontra skills em `.agents/skills`; Claude encontra skills em `.claude/skills` e comandos em `.claude/commands/opsx`. `CLAUDE.md` importa `@AGENTS.md`.

| Operação | Codex CLI/IDE | Claude Code |
|---|---|---|
| Explorar | `$openspec-explore` | `/opsx:explore` |
| Propor | `$openspec-propose` | `/opsx:propose` |
| Implementar | `$openspec-apply-change` | `/opsx:apply` |
| Verificar | `$openspec-verify-change` | `/opsx:verify` |
| Atualizar change | `$openspec-update-change` | `/opsx:update` |
| Sincronizar specs | `$openspec-sync-specs` | `/opsx:sync` |
| Arquivar | `$openspec-archive-change` | `/opsx:archive` |

No aplicativo desktop Codex, as skills também podem ser selecionadas pelo painel Skills. A confirmação de discovery na sessão real de cada agente está pendente; veja [VALIDATION.md](VALIDATION.md).

Exemplo para iniciar: “Leia AGENTS.md e a issue #N. Explore o escopo e apresente os riscos. Depois, proponha a change nome-da-change seguindo os gates do repositório.”

## Economizar contexto e tokens sem reduzir qualidade

1. Inicie pela issue, `AGENTS.md`, `openspec/config.yaml` e pelo [mapa de contexto](../agent-context-map.md). Consulte somente as fontes do domínio afetado; não carregue todos os documentos do projeto por padrão.
2. Use `adaptive-ai-workflow` para classificar Fast/Standard/Critical. A classificação orienta **a profundidade da exploração e a frequência de revisões intermediárias**, não dispensa proposta, aprovação, testes ou os gates obrigatórios.
3. Em uma retomada, consulte o estado da branch, diff, change/tasks e último resultado do CI; não reenvie todo o histórico da conversa. Mantenha um checkpoint curto com objetivo, arquivos alterados, decisões aprovadas, testes e próximo passo, preferencialmente na issue/PR.
4. Durante Apply, examine primeiro o diff e execute verificações direcionadas ao trecho alterado para feedback rápido. **Antes da PR e nos gates finais**, execute `npm run validate` e todas as verificações exigidas para o escopo.
5. Evite rodar Claude e Codex para a mesma revisão sem objetivo distinto. Quando a segunda revisão for necessária, forneça o diff, critérios de aceite e achados da primeira, em vez de pedir nova exploração integral.
6. Para medir economia, registre tokens de entrada/saída e número de chamadas quando a ferramenta os disponibilizar. Separe essas métricas de tempo de CI e minutos de runner; não apresente estimativas como medições.

## Consultar e validar uma change

Os exemplos abaixo são comandos de terminal. O fluxo e os gates de revisão, implementação, PR, CI e conclusão estão na seção **Processo obrigatório** de AGENTS.md; o [template de PR](../../.github/pull_request_template.md) orienta a entrega para revisão.

```bash
npm exec -- openspec list --json
npm exec -- openspec new change nome-da-change --json
npm exec -- openspec instructions proposal --change nome-da-change --json
npm exec -- openspec instructions specs --change nome-da-change --json
npm exec -- openspec instructions design --change nome-da-change --json
npm exec -- openspec instructions tasks --change nome-da-change --json
npm exec -- openspec status --change nome-da-change --json
npm exec -- openspec instructions apply --change nome-da-change --json
npm run validate
```

`new change` cria metadados; a skill Propose escreve os artefatos pelos templates. `status.isPlanningComplete` informa a existência dos artefatos. A skill Verify compara a implementação com a change; `validate` verifica o formato. Nenhum desses resultados representa aprovação humana ou teste do app.

Para consultar os inputs de conclusão: `npm exec -- openspec instructions archive --change nome-da-change --json`. Com todas as tarefas concluídas e os gates/autorização definidos em AGENTS.md, execute `npm exec -- openspec archive nome-da-change` na branch da PR; ele sincroniza os deltas por padrão. Inclua archive e specs no commit da PR e execute novamente `npm run validate`. Após revisão do diff final, CI verde e autorização de merge, use squash:

```bash
gh pr merge <numero-da-pr> --squash --match-head-commit <sha-final-revisado>
```

Use o SHA final aprovado para impedir integração acidental de commits posteriores à revisão. Esses comandos são exemplos e não concedem autorização de execução. O fluxo de exceção por restrição de integração prévia está em AGENTS.md; registrar sua justificativa/aprovação na seção Conclusão da PR antes de executar a sequência alternativa.

## Retomar em outro chat ou agente

Comece por AGENTS.md e suas referências. Consulte branch/status Git, issue, PR, revisões e CI do commit atual. Depois de `npm ci --ignore-scripts`, use `list`, `status` e `instructions apply` dos exemplos acima para localizar a change e suas tarefas. [VALIDATION.md](VALIDATION.md) guarda evidências e limitações; [GITHUB.md](GITHUB.md) registra a preparação de qualidade e planejamento.

## Referências oficiais

- [Release OpenSpec v1.15.0](https://github.com/Fission-AI/OpenSpec/releases/tag/v1.15.0)
- [CLI v1.15.0](https://github.com/Fission-AI/OpenSpec/blob/v1.15.0/docs/cli.md)
- [Ferramentas suportadas](https://github.com/Fission-AI/OpenSpec/blob/v1.15.0/docs/supported-tools.md)
- [Codex AGENTS](https://developers.openai.com/codex/guides/agents-md/)
- [Claude memória/imports](https://code.claude.com/docs/en/memory)
