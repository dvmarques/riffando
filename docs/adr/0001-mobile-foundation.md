# ADR 0001 — Organização da fundação mobile

- Data: 26/10/2026.
- Status: **Proposto, aguardando aprovação do mantenedor**.
- Referência: [GC-001/#11](https://github.com/dvmarques/riffando/issues/11).
- Change: [define-mobile-foundation](../../openspec/changes/define-mobile-foundation/proposal.md).

## Contexto

Existe um produto mobile, documentação e tooling Node; nenhum aplicativo foi implementado. A issue e a árvore original sugerem apps/mobile e packages, enquanto AGENTS.md exige avaliar app único antes de criar estruturas.

## Alternativas

App único: um manifest/lock, app e src na raiz, módulos Expo locais quando necessários; menos configuração, isolamento via imports/lint. Monorepo npm workspaces: apps/mobile e pacotes privados com fronteiras explícitas e reuso entre consumidores; exige resolução, testes por workspace e cuidado com duplicação de módulos nativos. Expo suporta as duas opções.

## Recomendação sujeita a aprovação

Começar com app único na raiz, Expo Router e TypeScript estrito. Ampliar manifest de tooling existente, preservar scripts/lock e separar UI, domínio puro e adaptadores. Não criar workspaces ou pacotes vazios. Extrair pacote quando houver segundo consumidor concreto ou API/versionamento independente comprovadamente necessário. Android/iOS do mesmo app não bastam para justificar monorepo.

## Consequências e validação

Menos custo inicial de tooling; exige bloqueio de dependências entre camadas e futura movimentação de arquivos se houver extração. A aprovação precisa resolver explicitamente a divergência com #11. Critérios, plano de extração, dependências, licenças, testes e CI estão no [design](../../openspec/changes/define-mobile-foundation/design.md); não há medição ou implementação neste ADR.

Este status só muda mediante aprovação registrada. Nenhuma alteração da issue, stack adicional, Apply, archive ou merge é autorizada pela escrita do ADR.
