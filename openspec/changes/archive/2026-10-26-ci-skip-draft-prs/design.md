## Context

O workflow `CI` roda `npm run validate` em Linux e Windows. O evento `pull_request` padrão cobre `opened`, `synchronize` e `reopened`, não `ready_for_review`. O Admin DS usa `if:` por job e inclui `ready_for_review` nos tipos.

## Goals / Non-Goals

Evitar CI em PRs Draft sem enfraquecer o gate final. Não alterar proteção de branch, matriz de sistemas, versões ou o conteúdo de `npm run validate`.

## Decisions

- Condição `github.event_name != 'pull_request' || github.event.pull_request.draft == false` no job, igual ao Admin DS; `push` e `workflow_dispatch` não são afetados.
- Incluir `ready_for_review` em `types`; sem isso, a transição Draft para Ready não executaria CI e a PR ficaria sem checks.
- `concurrency` permanece; uma execução em andamento não é cancelada retroativamente se a PR voltar a Draft.

## Risks

Uma PR Draft não prova validação: o autor deve rodar `npm run validate` localmente. Se a proteção de branch exigir o check `quality`, um check skipped é aceito pelo GitHub como sucesso; a PR continua exigindo CI verde no commit final conforme AGENTS.md. Validação real do comportamento exige abrir uma PR Draft e marcá-la Ready, o que é feito na própria PR desta change.
