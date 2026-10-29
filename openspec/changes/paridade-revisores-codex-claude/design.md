# Design

## Context

OpenSpec já entrega sete fluxos para ambos os agentes. Os dois revisores Claude existentes precisam de equivalentes Codex para checkouts limpos.

## Goals / Non-Goals

Manter escopo e instruções consultivas equivalentes. Não alterar o fluxo OpenSpec nem definir modelo ou permissões globais.

## Decisions

Versionar TOML em `.codex/agents`, formato de descoberta documentado pelo Codex, e verificar equivalência com as instruções Claude. Os TOML originais no checkout principal são preservados. A limitação de ferramentas somente leitura do Claude não é uma garantia técnica equivalente no Codex: instruções consultivas não substituem sandbox. Não incluir cópias `source-command-opsx-*`.

## Risks / Trade-offs

Os agentes podem divergir se editados separadamente; uma verificação deve detectar divergências. Discovery e execução dependem da versão e da sessão Codex; não presumir execução real.
