# Proposal

## Why

A [issue #11 — GC-001](https://github.com/dvmarques/riffando/issues/11) pede uma fundação Expo/TypeScript em monorepo, mas existe apenas documentação e tooling Node. Precisamos resolver a organização antes de criar o aplicativo e definir evidências de qualidade que não confundam validação documental com execução mobile.

## What Changes

- Recomendar **app único na raiz**, com Expo Router, TypeScript estrito e domínio desacoplado; comparar monorepo e definir gatilhos de extração no design e no ADR proposto.
- Planejar um shell Android mínimo com navegação, textos e acessibilidade pt-BR, inicialização offline e erro recuperável; sem funcionalidades musicais.
- Definir dependências mínimas, instalação reproduzível, development build, testes de comportamento, scripts reais e CI sem serviço pago obrigatório.
- Preservar fronteiras de UI, domínio, persistência e áudio, sem antecipar banco, DSP ou pacotes vazios.
- Manter esta PR exclusivamente de planejamento. Todas as tarefas de implementação ficam abertas. A recomendação não modifica o título/escopo da issue no GitHub nem aprova arquitetura automaticamente.

### Estado e aprovação

Já aprovados: React Native + Expo + TypeScript, Android primeiro, possibilidade de iOS, offline-first e ausência de backend/login obrigatório. Expo Router e SQLite são direções documentadas. **Sujeitos à aprovação:** app único em lugar do monorepo de #11, seleção mínima de bibliotecas e gates descritos aqui. A aprovação deve registrar explicitamente essa divergência; Apply exige nova solicitação do mantenedor.

### Fora do escopo

Afinador, metrônomo, teoria musical, exercícios, sessões, design system completo, banco/migrações, áudio/USB/DSP, publicação/assinatura de loja, OTA, iOS executável e serviços remotos. Não instalar Zustand, Drizzle, Zod, SVG, Reanimated ou Maestro por antecipação. O spike de áudio permanece necessário e separado.

### Critérios de aceite da implementação futura

- CA-01: instalação limpa com Node/npm fixados e lock único; app único sem workspaces/pacotes vazios; versões Expo/React/RN compatíveis e registradas.
- CA-02: shell Router com início e informações/configurações da fundação, ida/volta e retorno Android; texto, rótulos e erro recuperável em pt-BR; nenhum recurso musical apresentado como disponível.
- CA-03: TypeScript estrito, dependências entre camadas verificadas por lint e testes que falham em regressões reais.
- CA-04: shell em APK autônomo inicia em modo avião sem Metro, login, upload ou permissão de microfone; indisponibilidade e erro exibem estado honesto com ação de recuperação.
- CA-05: scripts de lint, tipos, testes, exportação JS e APK Android executam trabalho real; checks existentes permanecem; CI bloqueia regressões e registra artefato Android.
- CA-06: README reproduz instalação, execução, testes, build e troubleshooting em Windows/Linux; licenças e versões avaliadas; evidências de acessibilidade e execução Android anexadas.

Os cenários da [spec](specs/mobile-foundation/spec.md) e a rastreabilidade no [design](design.md) detalham esses critérios. Esta PR satisfaz a entrega de proposta, não esses critérios de implementação nem o encerramento de #11.

## Capabilities

### New Capabilities

- `mobile-foundation`: shell Android offline e acessível, fronteiras de dependência e ferramentas reproduzíveis de qualidade/build do aplicativo.

### Modified Capabilities

Nenhuma. `ai-development-workflow` permanece vigente; sua validação documental não substitui os novos gates mobile.

## Impact

Agora: quatro artefatos OpenSpec, ADR com status proposto, referências no contexto/decisões/arquitetura e changelog. Nenhum manifest, lock, workflow ou código mobile é alterado.

Após aprovação e Apply: manifest existente evolui sem perder tooling/override; novos arquivos de app, configuração TS/lint/Jest, CI e guia de execução. A árvore monorepo da arquitetura será substituída somente quando a decisão for aprovada. Riscos centrais: acoplamento indevido entre camadas, compatibilidade do SDK com Node 24 e toolchain Android e falsa confiança de mocks para código nativo. EAS não é requisito; áudio não validado.
