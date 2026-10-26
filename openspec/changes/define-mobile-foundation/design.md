# Design

## Context

Motivação e limites em [proposal.md](proposal.md). Base observada: main em `20bf804`, documentação e ferramentas Node 24/npm, OpenSpec 1.15.0, um lockfile, CI documental Linux/Windows e nenhum app. A única spec permanente é `ai-development-workflow`; seus quatro requisitos continuam intactos.

A issue #11 menciona monorepo. AGENTS.md e a arquitetura mantêm essa escolha aberta. Todas as decisões abaixo são **propostas**; o [ADR 0001](../../../docs/adr/0001-mobile-foundation.md) não significa aprovação. A [spec mobile-foundation](specs/mobile-foundation/spec.md) é um delta de comportamento futuro, não baseline entregue.

## Goals / Non-Goals

**Goals:** reduzir o custo de começar um único produto Android, preservar portabilidade de domínio para iOS e permitir validar módulos nativos cedo sem tornar EAS obrigatório. Tornar diferenças entre testes JS, exportação e APK explícitas.

**Non-Goals:** tornar todas as features do PRD executáveis, criar contratos abstratos sem consumidor ou provar metas de latência/FPS. As fronteiras abaixo orientam crescimento; diretórios só surgem com arquivos necessários.

## Decisions

### 1. App único versus monorepo

**Opção A — app único na raiz (recomendada):** um manifest e lock, Expo Router em `app/`, código em `src/` e módulos locais futuros em `modules/`. O manifest de tooling existente será ampliado sem sobrescrever scripts, OpenSpec ou override. Vantagens para o estágio atual: um consumidor, uma configuração de Metro/Jest/TS, instalação e execução simples. Custo: isolamento é reforçado por lint/imports em vez de fronteiras de package; uma extração futura move arquivos e imports.

**Opção B — monorepo npm workspaces:** raiz de tooling/orquestração, `apps/mobile`, pacotes por domínio em `packages/`, lock único e scripts encaminhados. Justifica-se com múltiplos consumidores e releases/fronteiras próprias; Android e iOS do mesmo app não são dois consumidores. Custa configurar resolução e testes por workspace, verificar autolinking e evitar React/React Native/módulos nativos duplicados. Expo suporta monorepos; a recomendação não é uma limitação do framework. Nx/Turborepo não são necessários para nenhuma das opções agora.

**Escolha proposta:** A, sem workspaces e sem pacotes vazios. Diverge do título e da árvore original de #11; registrar aprovação explícita antes de Apply e, então, ajustar escopo da issue e arquitetura. Se o mantenedor preferir B, revisar proposal/design/spec/tasks antes de qualquer código, sem misturar ambas as estruturas.

**Gatilho de extração:** segundo consumidor concreto de domínio (outro app/CLI), ou necessidade comprovada de API/versionamento independente com testes de contrato. Documentar consumidor e benefício em novo ADR. Extrair primeiro domínio puro para pacote privado, declarar exports/dependências, mover app para `apps/mobile` se necessário, atualizar imports, Metro/autolinking, Jest, TS, comandos e CI. Preservar comportamento com os mesmos testes. Não extrair apenas por tamanho ou para simular arquitetura de backend.

### 2. Organização e direção de dependências

Árvore conceitual futura, sem obrigação de criar todos os diretórios:

```text
app/                         rotas/layouts/error boundary; sem regra musical
src/features/foundation/     telas de início e informações da fundação
src/domain/                  regras puras quando surgirem consumidores
src/infrastructure/          adaptadores SQLite/áudio futuros
src/shared/ui/               componentes realmente reutilizados
src/shared/i18n/             recursos pt-BR e resolução mínima de mensagens
modules/                     módulos Expo locais futuros, fora de app/
docs/                        produto, decisões e operação existentes
```

Rotas compõem features. Features usam domínio e recebem adaptadores pelo ponto de composição. Domínio não importa React, RN, Expo, banco, rede ou áudio nativo. Infraestrutura depende dos contratos de domínio/aplicação quando necessários; domínio não conhece implementações. Features não importam detalhes de outra feature: compartilhar uma API pequena apenas se houver uso real. Evitar barrels globais e ciclos.

No início há apenas o shell. Não criar music-theory, scoring-engine, banco, repositórios genéricos, container DI ou interfaces de áudio sem implementação/consumidor. Configurar restrições de imports por caminhos resolvidos (aliases e relativos), com lint de ciclos e prova negativa temporária. Manter fixtures dessa prova no teste de tooling se necessárias para verificar o mecanismo; não criar regra musical fictícia só para obter cobertura.

UI: estado local React e composição simples; recursos pt-BR fora do domínio. A tela de informações explica a fase de planejamento. Área sem feature usa mensagem de indisponibilidade, sem botões que prometam afinador funcional. Error boundary oferece recuperação; estado de carregamento só onde houver operação assíncrona real, com teste sem atraso artificial de produção.

### 3. TypeScript e ferramentas

Estender `expo/tsconfig.base`; habilitar `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` e `noEmit`; conferir compatibilidade do SDK. Evitar `any` e supressões sem motivo localizado. Aliases devem funcionar de forma idêntica em TS, Metro, Jest e ESLint; preferir um alias simples para `src` e imports relativos curtos. Roteamento segue nomes do Expo Router.

Manter Node 24 enquanto satisfizer a matriz oficial do SDK escolhido; fixar versão npm em `packageManager` e documentar patch de Node usado em CI. Selecionar e registrar na implementação **um SDK estável suportado**, com versões exatas resolvidas de Expo, React, React Native e TypeScript, sem canary e sem misturar versões manualmente. Usar `expo install` para dependências vinculadas ao SDK, lock versionado, `expo install --check` e `expo-doctor` fixado como ferramenta. Não fixar um SDK neste planejamento sem instalar/testar a combinação. Incompatibilidade com Node 24 exige revisão explícita da matriz, não upgrade global silencioso.

### 4. Dependências e licenças

Plano mínimo sujeito a aprovação e conferência das versões efetivamente resolvidas:

- Runtime: `expo`, `react`, `react-native`, `expo-router` e peers necessários ao Router, como `react-native-safe-area-context` e `react-native-screens`, segundo a instalação oficial do SDK. `expo-status-bar` somente se usado. `expo-dev-client` para desenvolvimento nativo. Evitar duplicações e remover exemplos/deps não usados do template.
- Desenvolvimento: TypeScript e tipos compatíveis, ESLint com `eslint-config-expo` e regra de fronteira/ciclos compatível, Jest com `jest-expo`, `@types/jest` e `@testing-library/react-native`. Alinhar versões/peers com React; não adotar testes DOM, `react-test-renderer` ou snapshots extensos como base de confiança.
- Preservar OpenSpec/markdownlint e scripts atuais. Prettier é opcional e não justifica gate duplicado inicialmente. Não adicionar Babel/Metro custom sem necessidade comprovada.
- SQLite é direção aprovada para persistência futura: `expo-sqlite` será avaliado na demanda de banco; Drizzle depende de necessidade de migração/consulta. Fundação não inclui esquema fictício ou acesso ao banco.
- Zustand somente quando estado compartilhado mostrar necessidade além de hooks/contexto; Zod ao surgir fronteira de dados externos; Reanimated/SVG ao surgir visualização concreta; Maestro após validar runner/dev build em seu refinamento. Nenhum é pré-requisito do shell.
- DSP C++/Kotlin/Swift e qualquer biblioteca de captura/pitch dependem do spike e avaliação de licença; não presumir que uma API de gravação exponha PCM/timestamps de tempo real.

Antes de adicionar cada versão, registrar finalidade, versão, licença SPDX ou texto identificado, origem e obrigações de avisos/distribuição, inclusive transitivas que entrarão no APK. Conferir LICENSE/NOTICE do pacote e repositório da versão, não só metadados npm. Não há avaliação jurídica ou compatibilidade integral demonstrada nesta PR. Copyleft/restrições/termos desconhecidos bloqueiam a adição até revisão; manter PolyForm Noncommercial e direitos de terceiros. Auditoria de vulnerabilidades complementa essa avaliação, não comprova licença. Sem licença de pacote nova aprovada por este documento.

### 5. Builds nativos e fronteira de áudio

Adotar Continuous Native Generation: configuração Expo/plugins e módulos locais são fonte; `android/` e `ios/` gerados não são editados manualmente nem versionados inicialmente. Testar regeneração limpa no worktree sem apagar trabalho local. Alteração nativa futura que não possa ser expressa assim exige ADR. Development build com `expo-dev-client` é o caminho para módulos próprios; Expo Go é apenas conveniência para UI compatível e não evidência de áudio nativo.

Android local em Windows/Linux: Android Studio/SDK, JDK e build-tools alinhados à matriz do SDK/RN escolhido, documentados com versões efetivamente testadas. iOS exige macOS/Xcode e validação posterior; esta change não afirma compilação iOS. Não introduzir EAS Build/Update, contas Expo ou assinatura de loja como requisitos.

Build de CI: prebuild Android limpo e Gradle `assembleRelease` com variante de validação e assinatura de debug somente para instalação interna; JavaScript embarcado e nenhum segredo de produção. Não distribuir esse artefato como release de loja. Development APK usa Metro e não satisfaz sozinho o teste de inicialização offline. Exportação JS também não substitui APK.

Áudio futuro: captura PCM, DSP, timestamps monotônicos e clique preciso permanecem nativos; UI recebe eventos limitados, unsubscribe e erros. Domínio puro consome resultados sem referência à bridge. Spike separado registra aparelho/modelo, Android, entrada microfone/USB, sample rate/buffer, timestamps, latência entrada/saída e jitter com método/repetições. Cobrir recusa/revogação, interrupção/foco, troca/remoção USB e fallback explícito. Metas ±5 cents/<5 ms/60 FPS continuam hipóteses. Sem captura/permissão/PCM no shell; nenhum resultado físico foi medido nesta proposta.

### 6. Estratégia de testes

Unidades puras quando houver domínio real: entradas/limites/erros determinísticos, sem carregar React Native. Não inventar algoritmo musical nesta fundação. Componentes/fluxos: React Native Testing Library com `jest-expo`, queries por papel/nome acessível; navegar início → informações → voltar, mensagem de indisponibilidade e injeção controlada de erro/recuperação. Verificar textos pt-BR e ações, evitando asserts de detalhes internos ou dependência exclusiva de snapshots.

Jest tem mocks nativos: SQLite, bridge, USB, temporização e desempenho não ficam comprovados. Integrações reais de migração/rollback serão exigidas na issue de persistência. E2E automatizado com Maestro é candidato posterior; não incluir job vazio como evidência de E2E.

Nesta fundação, smoke Android manual obrigatório em APK embarcado: instalação limpa, iniciar a frio em modo avião/Metro desligado, navegar/voltar, fechar/reabrir, TalkBack e fonte 200%. Registrar modelo ou AVD, OS/API, versão/SHA/APK, passos, resultado e limitações. Emulador atende smoke do shell; aparelho físico será obrigatório ao afetar áudio, USB ou desempenho. Alvos de toque mínimos 48 dp e contraste de texto normal ao menos 4,5:1, sem depender apenas de cor. Testar erro por injeção em teste, não com botão de debug publicado.

Checks negativos: introduzir temporariamente erro de TS, import proibido por alias e por caminho relativo, teste quebrado e falha de compilação; observar comando/check falhar e reverter. Não versionar regressões. Cobertura informativa por camada, sem percentual arbitrário que incentive teste espelho.

### 7. Scripts e CI propostos

Todos os comandos abaixo são contratos da implementação; ainda não existem:

- `start`: iniciar Expo com dev client; `android`: compilar/abrir development build local, sem depender de Expo Go.
- `lint`: ESLint mobile e regras de fronteiras; `typecheck`: `tsc --noEmit`; `test`: execução local; `test:ci`: Jest não interativo, sem permitir sucesso por ausência de testes, com relatório/cobertura.
- `check:expo`: diagnóstico compatível e checagem de versões; `export:android`: exportar bundle Android para diretório de artefatos.
- `build:android`: gerar projeto Android e APK de validação com JS embarcado; wrapper portável Node invoca Gradle/gradlew.bat, sem sintaxe Bash no contrato Windows.
- `validate`: manter todas as verificações atuais e agregar lint, tipos e testes JS. Exportação e build nativo em jobs explícitos, evitando mascarar seu custo e seus pré-requisitos no comando documental.

CI futuro em toda PR para main e push main: preservar checks documentais Linux/Windows; qualidade JS/diagnóstico/exportação em Linux com instalação por lock; smoke de instalação e scripts portáveis em Windows. Compilação Android em Linux com setup de JDK/SDK conforme matriz, prebuild regenerado, APK e relatório retidos por 7 dias. Cache npm por OS/Node/lock e Gradle por toolchain/lock, sem depender de cache para passar. Timeout inicial: 15 min qualidade e 30 min Android; calibrar com evidências.

Permissões `contents: read`, sem secrets em PR, sem `pull_request_target`, cancelamento por PR e ações com referências verificadas na implementação. Logs não contêm áudio privado. Jobs pesados podem filtrar mudanças estritamente documentais somente com check agregador que distinga dispensa justificada de sucesso executado; para a primeira implementação executar todos. Um gate agregado falha se qualquer job obrigatório falhar/cancelar. Documentar nomes estáveis para proteção; alteração de branch protection exige autorização específica, fora desta proposta. EAS opcional futuro não substitui rota local; quotas/custos Actions devem ser conferidos antes de ampliar matriz.

### 8. Rastreabilidade e documentação

- CA-01 → instalação/diagnóstico da spec; tarefas 1 e 2; evidência de checkout limpo, lock e matriz de versões/licenças.
- CA-02 → navegação mínima; tarefas 3 e 4; testes de ida/volta/Android e indisponibilidade.
- CA-03 → fronteiras/gates; tarefas 2 e 4; typecheck, lint, testes e provas negativas.
- CA-04 → offline/privacidade/estados; tarefas 3 e 5; APK embarcado, modo avião e recuperação.
- CA-05 → gates/build; tarefas 5 e 6; logs distintos de exportação/compilação e artefato do SHA.
- CA-06 → reprodução/acessibilidade; tarefas 7; guia Windows/Linux, smoke Android e revisão documental.

A issue #11 fica aberta: a proposta não entrega mobile/packages. Se app único for aprovado, documentar substituição desse critério por estrutura única verificável, sem alterar a issue sem autorização para seu refinamento. Coordenar #14 (qualidade/CI) e demandas de design system/banco sem implementar seus escopos completos. Atualizar README, contexto, decisões, arquitetura e changelog na implementação para refletir o que realmente existir.

## Risks / Trade-offs

- [SDK/peers/JDK incompatíveis] → escolher matriz testada no primeiro incremento e registrar versões exatas antes de expandir o shell; parar/revisar se Node 24 não for suportado.
- [App único acumular acoplamento] → imports por fronteira, ciclos bloqueados e extração com consumidor comprovado; não converter preventivamente em monorepo.
- [Mocks ocultarem problemas nativos] → APK real separado da exportação e smoke Android, spike físico de áudio separado.
- [CNG perder alteração manual] → manter plugins/módulos como fonte e testar geração limpa sem remover arquivos do desenvolvedor.
- [CI lento ou com custo] → matriz mínima, cancelamento/cache, sem serviço recorrente obrigatório; medir duração real.
- [Proposta confundida com entrega] → tarefas abertas, ADR proposto, issue não encerrada, sem sync/archive do delta.

## Migration Plan

Não há app nem dados de usuário para migrar. Após aprovação e nova solicitação Apply, ampliar manifest existente de forma incremental, criar shell e checks no worktree, comparar com critérios e registrar evidências. Preservar licença e tooling. Reverter os commits da fundação restaura tooling documental, sem migração destrutiva; pacote instalado de validação pode ser desinstalado, sem dados reais nesta fase.

Esta PR é para revisão da proposta e permanece aberta. Não há restrição técnica que exija integrar planejamento antes de completar as tarefas. Após aprovação, Apply deve continuar nesta branch/PR para que implementação, todas as tarefas, archive/sync autorizado e squash sigam o fluxo padrão. Se for desejado integrar apenas planejamento, isso exige discutir explicitamente o fluxo com o mantenedor; esta proposta não concede exceção nem autorização de merge.

## Open Questions

Somente detalhes não estruturais ficam para Apply: patch exato da matriz suportada, identificador Android de desenvolvimento e aparelho/AVD disponível para evidência do shell. Mudanças que alterem critérios, biblioteca central ou topologia exigem revisão da proposta.

## Referências verificadas em 26/10/2026

- [Expo monorepos](https://docs.expo.dev/guides/monorepos/): suporte e cuidados de resolução/módulos nativos duplicados.
- [TypeScript](https://docs.expo.dev/guides/typescript/): configuração base e aliases.
- [Development builds](https://docs.expo.dev/develop/development-builds/introduction/): binário próprio com bibliotecas nativas.
- [CNG](https://docs.expo.dev/workflow/continuous-native-generation/): fonte configurável e geração de projetos nativos.
- [Testes Jest](https://docs.expo.dev/develop/unit-testing/): preset jest-expo e mocks nativos.

A escolha de app único, os gates e o adiamento de bibliotecas são recomendações para o estágio observado do Riffando, não imposições dessas fontes. Versões e compatibilidade devem ser revalidadas no Apply.
