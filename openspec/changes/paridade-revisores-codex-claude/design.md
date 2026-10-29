# Design

## Context

OpenSpec já entrega sete fluxos para ambos os agentes. Os dois revisores Claude existentes precisam de equivalentes Codex para checkouts limpos.

## Goals / Non-Goals

Manter escopo e instruções consultivas equivalentes. Não alterar o fluxo OpenSpec nem definir modelo ou permissões globais.

## Decisions

Versionar TOML em `.codex/agents`, formato de descoberta documentado pelo Codex, e verificar equivalência com as instruções Claude. Os TOML originais no checkout principal são preservados. A limitação de ferramentas somente leitura do Claude não é uma garantia técnica equivalente no Codex: instruções consultivas não substituem sandbox. Não incluir cópias `source-command-opsx-*`.

## Risks / Trade-offs

Os agentes podem divergir se editados separadamente; uma verificação deve detectar divergências. Discovery e execução dependem da versão e da sessão Codex; não presumir execução real.

## Seleção do CI

Um job de classificação consulta o diff entre o ponto de divergência da base e o head da PR. Apenas caminhos explicitamente reconhecidos como documentação ou definições de agentes podem reduzir o CI; tudo o mais, incluindo mudanças de configuração, scripts ou do próprio CI, exige matriz completa. Falha de Git ou base ausente falha de forma segura; lista vazia e modos de arquivo diferentes de arquivo regular exigem matriz completa. Push na main e execução manual sempre exigem matriz completa. Draft permanece sem jobs. O gate exige sucesso da classificação e documentação, sucesso dos demais jobs na matriz completa e status skipped somente para jobs deliberadamente dispensados. CI da própria alteração continua completo.
