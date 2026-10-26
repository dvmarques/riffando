# Desenvolvimento com IA — Riffando

## Fontes da verdade

Leia [AGENTS.md](../../AGENTS.md), [contexto](../PROJECT_CONTEXT.md), [decisões](../DECISIONS.md), [PRD](../product/PRD.md), [arquitetura](../architecture/ARCHITECTURE.md), [dados](../architecture/DATA_MODEL.md), [roadmap](../product/ROADMAP.md), issue e specs relacionadas. GitHub guarda o estado durável; conversa não substitui aprovação registrada ou documentação.

Esta entrega configura ferramentas. Não implementa GC-001…GC-041 nem conclui #11 ou #14.

## Ferramentas e pré-requisitos

- Git e Node.js 24 (linha LTS escolhida; `.nvmrc`); npm com suporte a lockfile v3.
- OpenSpec **1.15.0**, fixado como devDependency e no lockfile. O CLI requer Node >=20.19; o projeto padroniza 24.
- Codex CLI/IDE ou Claude Code instalados e autenticados pelo desenvolvedor. Esta configuração não instala agentes nem grava credenciais.
- Acesso ao GitHub; `gh` é opcional para issues/PRs. Não é necessário backend, Expo, SDK Android ou EAS para estas validações.

```bash
npm ci --ignore-scripts
npm run ai:setup
npm run validate
```

As integrações já estão versionadas. `ai:setup` serve para reproduzir/verificar a inicialização oficial; não sobrescreve `AGENTS.md`, `CLAUDE.md` ou o contexto existente em `openspec/config.yaml`. Não use `--force` para limpar configuração legada sem revisar o impacto.

O wrapper executa `openspec config set` e `openspec init --tools codex,claude --profile custom --language pt-BR --no-animation`. O perfil fica em diretório XDG temporário, removido ao terminar; não altera preferências globais. Delivery `both`, workflows `explore,propose,apply,verify,update,sync,archive`. Telemetria OpenSpec desativada nesses scripts e no CI. Para CLI avulso, use `OPENSPEC_TELEMETRY=0` (PowerShell: `$env:OPENSPEC_TELEMETRY='0'`) se desejar o mesmo comportamento.

## Organização e atualização

| Caminho | Responsabilidade |
|---|---|
| `AGENTS.md` | Guia operacional compartilhado |
| `CLAUDE.md` | Referência/importação de AGENTS, sem política paralela |
| `.agents/skills/openspec-*` | Skills oficiais do Codex; sem duplicação em `.codex` |
| `.claude/skills/openspec-*` | Skills oficiais do Claude |
| `.claude/commands/opsx` | Comandos nativos Claude |
| `openspec/config.yaml` | Schema, contexto e regras do projeto |
| `openspec/changes/<id>` | Proposta, design, deltas e tarefas ainda ativos |
| `openspec/specs/<capacidade>/spec.md` | Contratos aceitos e sincronizados |
| `scripts`, `.github` | Validações e fluxo de contribuição |
| `docs` | Produto, arquitetura, decisões e operação |

Os templates de proposal/design/specs/tasks vêm do schema oficial `spec-driven` da dependência fixa. `npm exec -- openspec templates --json` mostra os caminhos; `instructions` inclui regras de `config.yaml`. Não há fork de schema para manter.

Para atualizar: em branch, verificar release oficial/compatibilidade e licença; executar `npm install --save-dev --save-exact @fission-ai/openspec@<versao-aprovada>`, depois `npm run ai:update`, revisar mudanças geradas e executar `npm run validate`. Atualizar este guia e evidências na mesma PR. `ai:update` usa o CLI oficial `update --force` para regenerar somente os arquivos de integração: não editar skills/comandos manualmente. Não usar o perfil global de outro projeto por acidente. `node scripts/setup-openspec.mjs --check` mostra o plano de update sem gravar no projeto.

## Iniciar uma mudança

1. Ler issue e critérios; conferir specs e changes ativas com `npm exec -- openspec list --json`. Evitar duplicação e reutilizar código/componentes existentes.
2. Criar branch `feat/<numero>-<descricao>`, `fix/...`, `chore/...` ou `docs/...` a partir de main atualizada. Worktree é opção para isolamento. Preservar trabalho local não relacionado.
3. Explore: investigar somente leitura. Não editar arquivos, instalar dependências, gerar proposta ou executar mutações. Ao terminar, sair de Explore antes de Propose. A skill oficial admite captura de artefatos mediante confirmação; a regra local é mais restrita e proíbe qualquer escrita durante Explore.
4. Propose: gerar proposal, design, deltas e tasks; identificar issue real e GC, motivação, fora do escopo, critérios e riscos. Proposta não aprova implementação.
5. Revisar proposta com o mantenedor quando houver decisão arquitetural ou escopo não autorizado. Registrar aprovação no GitHub ou artefatos; não depender do chat.

## Comandos dos agentes

Reinicie a sessão após instalar ou regenerar integrações. Inicie na raiz e confirme que o agente leu AGENTS.md. No Claude, CLAUDE.md importa `@AGENTS.md`; o link também permite leitura explícita.

| Etapa | Codex CLI/IDE | Claude Code |
|---|---|---|
| Explorar | `$openspec-explore` | `/opsx:explore` |
| Propor | `$openspec-propose` | `/opsx:propose` |
| Implementar | `$openspec-apply-change` | `/opsx:apply` |
| Verificar | `$openspec-verify-change` | `/opsx:verify` |
| Atualizar change | `$openspec-update-change` | `/opsx:update` |
| Sincronizar specs | `$openspec-sync-specs` | `/opsx:sync` |
| Arquivar | `$openspec-archive-change` | `/opsx:archive` |

No aplicativo desktop Codex, selecione a skill pelo painel Skills. Codex usa skills; não espere comandos `/opsx:*` ou prompts globais. Claude também pode invocar as skills por seus nomes. A disponibilidade visual deve ser confirmada na sessão real de cada agente.

Exemplo de pedido ao agente: “Leia AGENTS.md e a issue #N. Invoque openspec-explore somente leitura e apresente riscos. Após encerrá-lo, proponha a change nome-da-change; não implemente sem o escopo autorizado.”

## CLI, revisão e implementação

Os comandos a seguir são de terminal, não comandos do chat:

```bash
npm exec -- openspec new change nome-da-change --json
npm exec -- openspec instructions proposal --change nome-da-change --json
npm exec -- openspec instructions specs --change nome-da-change --json
npm exec -- openspec instructions design --change nome-da-change --json
npm exec -- openspec instructions tasks --change nome-da-change --json
npm exec -- openspec status --change nome-da-change --json
npm exec -- openspec instructions apply --change nome-da-change --json
npm run validate:openspec
```

`new change` cria metadados; não escreve uma proposta completa nem a aprova. A skill Propose usa templates e escreve os artefatos. `status.isPlanningComplete` indica existência dos artefatos, não conclusão da implementação, aprovação humana ou CI.

Revisar cada requisito e cenário, alternativas, testes e tarefas. Implementar apenas o escopo autorizado e marcar tarefas somente com evidência. Mudança relevante exige change; manutenção sem alteração de capacidade pode usar `skip_specs: true` nos metadados com justificativa, conforme suporte oficial, sem inventar specs do app. Nesta entrega há uma capacidade de ferramentas, não funcionalidade mobile.

Execute `npm run validate` e, quando houver app, lint, typecheck, testes e build efetivamente disponíveis. Nenhum script mobile existe nesta fase: não interpretar isso como validação de Expo ou Android. Áudio/microfone/USB/latência exigem development build e aparelho físico, matriz de entradas, interrupções e confiança das medições.

A skill Verify compara implementação com artefatos; o CLI `validate` verifica formato. Nenhuma dessas operações substitui testes ou revisão humana. Antes do PR, revisar diff/código e documentação; não introduzir mudanças fora do escopo aprovado.

## PR, CI e code review

Commits Conventional Commits. Abrir um único PR coeso para main usando o template; vincular issue e change, apresentar resultado, comandos executados, limitações e riscos. Usar `Refs #N` em entrega parcial e `Closes #N` somente quando todos os critérios forem atendidos.

Aguardar o workflow `CI` / job `Documentação e OpenSpec`; corrigir falhas antes de pedir revisão. Branch protection recomendada em [GITHUB.md](GITHUB.md), sem alteração administrativa automática. A aprovação do autor/agente não substitui revisão do mantenedor.

## Concluir, sincronizar e arquivar

**Merge, squash e archive exigem autorização explícita.** Após aprovação e CI verde, o mantenedor autoriza o merge. Atualizar a issue com resultado/evidências e pendências; não fechar tarefa parcialmente entregue.

Após merge e autorização para archive, usar branch atualizada de main e PR de acompanhamento para registrar a sincronização e o histórico. O CLI `archive` sincroniza os deltas por padrão; não usar `--skip-specs` quando houver deltas. A skill sync pode ser usada explicitamente quando apropriado, mas não promove propostas não aprovadas ao baseline.

```bash
npm exec -- openspec instructions archive --change nome-da-change --json
# Somente após merge e autorização explícita:
npm exec -- openspec archive nome-da-change
npm run validate
```

Revisar o diff das specs, o diretório archive, contexto e decisões; submeter PR autorizado. Não arquivar a change deste setup antes do merge. O smoke automatizado usa somente uma change descartável em diretório temporário; ele não altera o histórico real.

## Retomar em outro chat ou agente

1. Ler AGENTS e fontes obrigatórias; verificar branch, status Git, issue e PR, sem confiar no estado desta página como status remoto atual.
2. Executar `npm ci --ignore-scripts`, listar changes e consultar status/tasks da change selecionada.
3. Ler comentários de revisão, CI do commit atual e evidências em [VALIDATION.md](VALIDATION.md).
4. Distinguir tarefas implementadas, validações pendentes e autorizações de merge/archive. Se não houver autorização registrada, manter o bloqueio.
5. Continuar somente o incremento aprovado; atualizar documentos e GitHub antes de encerrar.

## Referências oficiais e padrões adaptados

- [Release OpenSpec v1.15.0](https://github.com/Fission-AI/OpenSpec/releases/tag/v1.15.0)
- [CLI v1.15.0](https://github.com/Fission-AI/OpenSpec/blob/v1.15.0/docs/cli.md)
- [Ferramentas suportadas](https://github.com/Fission-AI/OpenSpec/blob/v1.15.0/docs/supported-tools.md)
- [Codex AGENTS](https://developers.openai.com/codex/guides/agents-md/)
- [Claude memória/imports](https://code.claude.com/docs/en/memory)

Inspeção em 26/10/2026: admin-design-system (develop, `5a7cef16`) forneceu padrões de AGENTS, CLAUDE, OpenSpec e CI com permissões mínimas. Back-admin e leaf-admin contribuíram com separação entre baseline e changes e leitura por escopo. Nenhum código ou detalhe interno privado foi copiado. Não foram transferidos Next.js, Server Components, CSS/Storybook, Maven, serviços, release branches ou automações de publicação. Não havia PR template na raiz `.github` do admin-design-system consultado; os templates deste projeto são próprios.
