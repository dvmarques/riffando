# Proposal

## Why

A [issue #11 — GC-001](https://github.com/dvmarques/riffando/issues/11) define a fundação Expo/TypeScript, enquanto existe apenas documentação e tooling Node. A arquitetura de app único foi aprovada pelo mantenedor para este planejamento em 26/10/2026; precisamos detalhar evidências de qualidade sem confundir especificação com aplicativo entregue.

## What Changes

### Escopo

Aplicativo único na raiz com React Native + Expo + TypeScript estrito e Expo Router; separação UI/features, domínio puro e infraestrutura; sem packages/workspaces desnecessários. Shell Android mínimo com início/informações, navegação e retorno Android, textos e acessibilidade pt-BR, estados honestos, recuperação e funcionamento offline. Instalação/diagnóstico Windows e Linux, versões/licenças verificadas, testes de comportamento, scripts reais, exportação JS, APK embarcado e gates de CI preservando checks documentais. Migração futura para monorepo somente com consumidor concreto ou API/versionamento independente comprovadamente necessário, documentados em novo ADR.

### Estado e aprovação

Decisão arquitetural aprovada para esta proposta: app único na raiz, React Native + Expo + TypeScript estrito, Expo Router e separação UI/domínio/infraestrutura. A autorização inclui atualizar título, descrição, escopo e critérios da issue #11. Justificativa e gatilhos de extração no ADR 0001 e design. Android primeiro, possibilidade de iOS, offline-first e ausência de backend/login obrigatório permanecem; SQLite é direção futura.

A etapa inicial alterou especificação/documentação e a issue. Após autorização separada de Apply, as 20 tarefas foram implementadas e verificadas. **A aprovação arquitetural não autoriza Apply, instalação de dependências mobile, archive/sync ou merge.** A matriz selecionada, compatibilidade/licenças e evidências constam no guia mobile; a PR #53 segue em revisão para integração.

### Fora do escopo

Afinador, metrônomo, teoria musical, exercícios, sessões, design system completo, banco/migrações, áudio/USB/DSP, publicação/assinatura de loja, OTA, iOS executável e serviços remotos. Não instalar Zustand, Drizzle, Zod, SVG, Reanimated ou Maestro por antecipação. O spike de áudio permanece necessário e separado.

### Critérios de aceite da implementação

- CA-01: instalação limpa Windows/Linux com Node/npm fixados e lock único; app único sem workspaces/pacotes vazios; matriz Expo/React/RN/TS/Node/npm/JDK/Android SDK documentada com fontes oficiais e diagnóstico que falha para pré-requisito ausente/incompatível antes do build.
- CA-02: shell Router com início e informações da fundação, ida/volta e retorno Android; texto, rótulos e erro recuperável em pt-BR; nenhum recurso musical apresentado como disponível.
- CA-03: TypeScript estrito, dependências entre UI, domínio e infraestrutura verificadas por lint, inclusive imports relativos e aliases, e testes de comportamento que falham em regressões reais.
- CA-04: shell em APK autônomo inicia em modo avião sem Metro, login, upload ou permissão de microfone; funcionalidades futuras mostram indisponibilidade; erro oferece recuperação verificável; loading apenas durante operação assíncrona real, sem delay artificial.
- CA-05: instalação, lint, tipos, testes, exportação JS e APK Android executam trabalho real; checks documentais Linux/Windows preservados; gate agregado aprova somente jobs obrigatórios executados com sucesso, rejeita falha/cancelamento/ausência/skip indevido e identifica dispensa válida por filtro sem chamá-la de execução; artefato Android registrado quando build exigido.
- CA-06: README reproduz instalação, diagnóstico, execução, testes, build e troubleshooting em Windows/Linux; licenças e versões avaliadas; evidências de acessibilidade e execução Android anexadas, com rastreabilidade CA → cenário → tarefa → comando/resultado/SHA.

Os mesmos escopo, exclusões e CA-01…CA-06 constam na issue e na [spec](specs/mobile-foundation/spec.md); os cenários e a rastreabilidade no [design](design.md) os detalham. A implementação e evidências foram adicionadas nesta PR após Apply autorizado; o encerramento de #11 depende da integração e dos gates finais.

## Capabilities

### New Capabilities

- `mobile-foundation`: shell Android offline e acessível, fronteiras de dependência e ferramentas reproduzíveis de qualidade/build do aplicativo.

### Modified Capabilities

Nenhuma. `ai-development-workflow` permanece vigente; sua validação documental não substitui os novos gates mobile.

## Impact

A PR contém planejamento aprovado, shell mobile, manifest/lock, configurações, scripts, testes, workflows, ADR e documentação/evidências; a issue #11 compartilha o mesmo escopo.

O Apply autorizado ampliou o manifest sem perder tooling/override e adicionou app, TS/lint/Jest, CI e guia de execução. Riscos centrais: acoplamento entre camadas, compatibilidade do SDK com Node 24/toolchain Android e falsa confiança de mocks para código nativo. EAS não é requisito; áudio não validado.

## Estado do Apply

O mantenedor aprovou o plano e autorizou separadamente o Apply nesta conversa em 26/10/2026. A restrição original de planejamento descreve a etapa anterior; shell e gates estão em implementação/validação. Seguir tasks.md para evidência real e pendências, sem expandir escopo, declarar aceite integral ou executar archive/merge antecipados.

## Estado verificado — 27/10/2026

Apply concluído e 20/20 tarefas verificadas, com builds Windows/Linux, exportação, smoke offline e gate aprovados no run 40522664541/head a556c82, além do teste manual TalkBack/fonte 200% confirmado pelo mantenedor. O escopo/exclusões/CA acima permanecem idênticos à issue. As restrições de planejamento originais foram sucedidas pela autorização separada de Apply; não autorizam archive/sync/merge. Evidências e limites consolidados em tasks.md e docs/development/MOBILE.md. O commit de fechamento documental ainda precisa de CI verde antes da integração.
