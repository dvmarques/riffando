# ADR 0001 — Organização da fundação mobile

- Data: 26/10/2026.
- Status: **Arquitetura aprovada para esta proposta pelo mantenedor; implementação não autorizada**.
- Referências: [GC-001/#11](https://github.com/dvmarques/riffando/issues/11), [PR #53](https://github.com/dvmarques/riffando/pull/53).
- Change: [define-mobile-foundation](../../openspec/changes/define-mobile-foundation/proposal.md).

## Contexto

Existe um produto mobile, documentação e tooling Node; nenhum aplicativo implementado. A issue originalmente exigia monorepo. Após a comparação das alternativas, o mantenedor autorizou app único para esta proposta e a atualização da issue (título, descrição, escopo e critérios) em 26/10/2026. Essa autorização não inicia Apply, instalação de dependências mobile, archive/sync ou merge.

## Alternativas e justificativa

App único: um manifest/lock, app e src na raiz, módulos Expo locais apenas quando necessários. Um consumidor e menor custo de configuração de Metro/Jest/TS favorecem esta opção; fronteiras exigem lint/imports e extração futura move arquivos. Monorepo npm workspaces: apps/mobile e pacotes privados com APIs/reuso entre consumidores, ao custo de resolução, testes por workspace e cuidado com duplicação nativa. Expo suporta as duas opções; Android/iOS do mesmo app não são dois consumidores.

## Decisão arquitetural

Adotar app único na raiz, React Native + Expo + TypeScript estrito e Expo Router, com separação UI/features, domínio puro e infraestrutura. Ampliar o manifest de tooling existente preservando scripts/lock. Não criar packages/workspaces ou diretórios vazios sem necessidade real. A escolha está consolidada, não pendente; seleção exata de SDK/toolchain e bibliotecas/licenças continua sujeita às verificações do plano na implementação separadamente autorizada.

## Critérios de migração futura

Reavaliar monorepo apenas com segundo consumidor concreto de domínio (outro app/CLI) ou necessidade comprovada de API/versionamento independente com testes de contrato. Registrar consumidor, benefício e custo em novo ADR; extrair domínio puro primeiro, declarar exports/dependências, mover app para apps/mobile se necessário e atualizar resolução, autolinking, TS, Jest, scripts e CI. Os mesmos testes devem preservar comportamento; tamanho do código isoladamente não justifica migração.

## Consequências e validação

Issue e OpenSpec compartilham escopo/exclusões e CA-01…CA-06. O [design](../../openspec/changes/define-mobile-foundation/design.md) detalha diagnóstico Windows/Linux, política do gate, dependências, testes e evidências. Aprovação arquitetural não comprova instalação, testes ou build mobile. Todas as tarefas permanecem abertas; a PR #53 segue em revisão documental sem implementação.

## Estado do Apply — 26/10/2026

Após aprovação do plano e autorização separada do mantenedor, GC-001 entrou em implementação na PR #53. Shell de início/informações, recuperação pt-BR, TS estrito, testes, diagnóstico e CI foram adicionados. Resultados e pendências atuais em [guia mobile](../development/MOBILE.md). Esta atualização supera as referências históricas acima a implementação não autorizada/não existente; não indica app completo. Somente tarefas verificadas são concluídas. Demais funcionalidades, inventário final/licenças, risco de transitivas e validação Android/acessibilidade permanecem fora de qualquer declaração de conclusão. Sem archive/merge.

## Fundação verificada — 27/10/2026

As 20 tarefas de GC-001 foram verificadas na branch da PR #53: builds Windows/Linux e sete checks do run 40522664541 aprovados no head a556c82; smoke Android offline, fonte 200% e TalkBack manual confirmados. Evidências, matriz, riscos e limites em [guia mobile](../development/MOBILE.md). Esse registro supera as pendências históricas de shell/build/acessibilidade acima. O aceite de vulnerabilidades é temporário e restrito ao tooling; nenhuma funcionalidade musical, publicação de loja, archive/sync ou merge foi realizada. Alterações documentais posteriores exigem CI do commit final e os gates de autorização permanecem.
