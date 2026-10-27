# ADR 0001 — Organização da fundação mobile

- Data: 26/10/2026.
- Status: **Aceito; implementação autorizada e verificada na PR #53**.
- Referências: [GC-001/#11](https://github.com/dvmarques/riffando/issues/11), [PR #53](https://github.com/dvmarques/riffando/pull/53).
- Change: [define-mobile-foundation](../../openspec/changes/archive/2026-10-27-define-mobile-foundation/proposal.md).

## Contexto

Na decisão original de 26/10/2026 havia documentação e tooling Node, ainda sem aplicativo. A issue originalmente exigia monorepo. Após a comparação das alternativas, o mantenedor autorizou app único para esta proposta e a atualização da issue (título, descrição, escopo e critérios) em 26/10/2026. A autorização inicial foi restrita ao planejamento; o Apply foi autorizado separadamente e concluído, sem ampliar o escopo funcional.

## Alternativas e justificativa

App único: um manifest/lock, app e src na raiz, módulos Expo locais apenas quando necessários. Um consumidor e menor custo de configuração de Metro/Jest/TS favorecem esta opção; fronteiras exigem lint/imports e extração futura move arquivos. Monorepo npm workspaces: apps/mobile e pacotes privados com APIs/reuso entre consumidores, ao custo de resolução, testes por workspace e cuidado com duplicação nativa. Expo suporta as duas opções; Android/iOS do mesmo app não são dois consumidores.

## Decisão arquitetural

Adotar app único na raiz, React Native + Expo + TypeScript estrito e Expo Router, com separação UI/features, domínio puro e infraestrutura. Ampliar o manifest de tooling existente preservando scripts/lock. Não criar packages/workspaces ou diretórios vazios sem necessidade real. A escolha está consolidada, não pendente; SDK/toolchain e bibliotecas/licenças selecionados e verificados constam no guia mobile.

## Critérios de migração futura

Reavaliar monorepo apenas com segundo consumidor concreto de domínio (outro app/CLI) ou necessidade comprovada de API/versionamento independente com testes de contrato. Registrar consumidor, benefício e custo em novo ADR; extrair domínio puro primeiro, declarar exports/dependências, mover app para apps/mobile se necessário e atualizar resolução, autolinking, TS, Jest, scripts e CI. Os mesmos testes devem preservar comportamento; tamanho do código isoladamente não justifica migração.

## Consequências e validação

Issue e OpenSpec compartilham escopo/exclusões e CA-01…CA-06. O [design](../../openspec/changes/archive/2026-10-27-define-mobile-foundation/design.md) detalha diagnóstico Windows/Linux, política do gate, dependências, testes e evidências. Instalação, testes, builds Windows/Linux e acessibilidade têm evidências próprias; as 20 tarefas estão verificadas. A aprovação arquitetural não substitui esses resultados.

## Estado da fundação

GC-001 foi implementado e as 20 tarefas verificadas na PR #53. Matriz, evidências Windows/Linux, TalkBack e limites em [guia mobile](../development/MOBILE.md). Archive/sync/squash autorizados pelo mantenedor em 27/10/2026, condicionados a revisão sem bloqueadores e CI verde no commit final.
