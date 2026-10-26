# Design

## Context

Motivação e limites em [proposal.md](proposal.md). Base observada: main em `20bf804`, documentação e ferramentas Node 24/npm, OpenSpec 1.15.0, um lockfile, CI documental Linux/Windows e nenhum app. A única spec permanente é `ai-development-workflow`; seus quatro requisitos continuam intactos.

O mantenedor aprovou app único na raiz para esta proposta e autorizou alinhar a issue #11 em 26/10/2026. O [ADR 0001](../../../docs/adr/0001-mobile-foundation.md) registra essa decisão arquitetural. O detalhamento operacional permanece planejamento em revisão; implementação exige nova solicitação Apply. A [spec mobile-foundation](specs/mobile-foundation/spec.md) é um delta de comportamento futuro, não baseline entregue.

## Goals / Non-Goals

**Goals:** reduzir o custo de começar um único produto Android, preservar portabilidade de domínio para iOS e permitir validar módulos nativos cedo sem tornar EAS obrigatório. Tornar diferenças entre testes JS, exportação e APK explícitas.

**Non-Goals:** tornar todas as features do PRD executáveis, criar contratos abstratos sem consumidor ou provar metas de latência/FPS. As fronteiras abaixo orientam crescimento; diretórios só surgem com arquivos necessários.

## Decisions

### 1. App único versus monorepo

**Opção A — app único na raiz (adotada para esta proposta):** um manifest e lock, Expo Router em `app/`, código em `src/` e módulos locais futuros em `modules/`. O manifest de tooling existente será ampliado sem sobrescrever scripts, OpenSpec ou override. Vantagens para o estágio atual: um consumidor, uma configuração de Metro/Jest/TS, instalação e execução simples. Custo: isolamento é reforçado por lint/imports em vez de fronteiras de package; uma extração futura move arquivos e imports.

**Opção B — monorepo npm workspaces:** raiz de tooling/orquestração, `apps/mobile`, pacotes por domínio em `packages/`, lock único e scripts encaminhados. Justifica-se com múltiplos consumidores e releases/fronteiras próprias; Android e iOS do mesmo app não são dois consumidores. Custa configurar resolução e testes por workspace, verificar autolinking e evitar React/React Native/módulos nativos duplicados. Expo suporta monorepos; a recomendação não é uma limitação do framework. Nx/Turborepo não são necessários para nenhuma das opções agora.

**Decisão arquitetural aprovada para o planejamento:** A, com React Native + Expo + TypeScript estrito e Expo Router, sem workspaces/pacotes vazios. A issue #11 e a documentação são alinhadas a esse escopo por autorização expressa do mantenedor. O monorepo é alternativa futura, sem pendência de escolha nesta fundação. A autorização não inicia implementação nem aprova versões/bibliotecas antecipadamente.

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

UI: estado local React e composição simples; recursos pt-BR fora do domínio. A tela de informações explica a fase de planejamento. Área sem feature usa mensagem de indisponibilidade, sem botões que prometam afinador funcional. Error boundary oferece recuperação verificável. Estado de carregamento só onde houver operação assíncrona real; o shell estático deve aparecer imediatamente. Não introduzir spinner, operação fictícia ou delay de produção para satisfazer um cenário. Se surgir operação necessária, testar promessa controlada pendente → sucesso/erro, rótulo pt-BR e retirada do loader. Testar também shell imediato sem loading, indisponibilidade honesta e recuperação após falha removida.

### 3. TypeScript e ferramentas

Estender `expo/tsconfig.base`; habilitar `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` e `noEmit`; conferir compatibilidade do SDK. Evitar `any` e supressões sem motivo localizado. Aliases devem funcionar de forma idêntica em TS, Metro, Jest e ESLint; preferir um alias simples para `src` e imports relativos curtos. Roteamento segue nomes do Expo Router.

Manter Node 24 enquanto satisfizer a matriz oficial do SDK escolhido; fixar versão npm em `packageManager` e documentar patch de Node usado em CI. Selecionar e registrar na implementação **um SDK estável suportado**, com versões exatas resolvidas de Expo, React, React Native e TypeScript, sem canary e sem misturar versões manualmente. Usar `expo install` para dependências vinculadas ao SDK, lock versionado, `expo install --check` e `expo-doctor` fixado como ferramenta. Não fixar um SDK neste planejamento sem instalar/testar a combinação. Incompatibilidade com Node 24 exige revisão explícita da matriz, não upgrade global silencioso.

### 3.1. Diagnóstico de ambiente, sem versões arbitrárias

Contratos futuros, sem scripts criados nesta revisão: `check:env` verifica o ambiente JS; `check:env:android` inclui o anterior e a toolchain nativa. `build:android` executa ambos antes de prebuild/Gradle. Os checks documentais atuais continuam exigindo somente seus pré-requisitos Node/npm; não passam a exigir JDK/Android nesta PR.

Na implementação autorizada, selecionar SDK Expo estável suportado e registrar tabela de versões exatas: Expo, React/RN, TypeScript, Node/npm, JDK, Gradle/Android Gradle Plugin, command-line tools, plataforma compileSdk e build-tools. Para cada item registrar intervalo suportado, versão fixada, URL oficial versionada/release notes e data. Conferir guia de ambiente e release do SDK Expo escolhido, requisitos da versão RN correspondente e compatibilidade Gradle/AGP/JDK do projeto gerado; obter compileSdk/build-tools da configuração gerada, não de números presumidos. Sem interseção comprovada entre matrizes, não selecionar versão por tentativa silenciosa: revisar a matriz antes de prosseguir. Node 24 existente permanece até revisão explícita se incompatível.

Verificações em Windows PowerShell e Linux, executadas por wrapper portável Node no Apply:

- JS: localizar executáveis (Windows `Get-Command node,npm`; Linux `command -v node` e `command -v npm`); executar `node --version`, `npm --version`, comparar com engines/.nvmrc/packageManager e matriz, depois `npm ci`. Ausência, versão fora do intervalo ou diferente da versão fixada de reprodução falham. Falha de lock, download ou resolução em npm ci é falha de instalação, não de compilação.
- JDK: conferir JAVA_HOME e PATH, executar `java -version` e `javac -version`, e os binários equivalentes em JAVA_HOME. Exigir JDK completo e versões compatíveis/coerentes. Após geração, `android/gradlew.bat --version` no PowerShell ou `./android/gradlew --version` no Linux identifica JVM efetiva; divergência com matriz/JAVA_HOME falha antes de assemble. O wrapper usa cwd android e invoca gradlew.bat/gradlew sem depender de sintaxe de shell comum.
- Android SDK: resolver raiz por ANDROID_HOME ou caminho documentado; se ANDROID_SDK_ROOT também existir, exigir mesma raiz. Localizar sdkmanager.bat no Windows e sdkmanager no Linux, executar `sdkmanager --version` e `sdkmanager --list` e ler somente a seção Installed packages; exigir command-line tools e pacotes platform-tools, platforms;android-<compileSdk> e build-tools;<versão> da matriz. Conferir `adb version` e licenças exigidas aceitas. sdkmanager precisa receber argumentos por lista, sem interpretar ponto e vírgula dos nomes de pacotes como separador shell. Não aceitar SDK diferente do usado pelo Gradle/local.properties.
- Expo: após instalação por lock, executar CLI local `npm exec -- expo install --check` e expo-doctor fixado no lock, sem baixar versão latest implicitamente. Comparar dependências/peers com o SDK selecionado. Diagnóstico Expo complementa os checks de JDK/SDK, não os substitui.

Classificar saída com código não zero e prefixo estável pt-BR: **pré-requisito ausente** (executável/raiz/pacote/licença indisponível), **pré-requisito incompatível** (versão/caminho/peers divergentes), **falha de diagnóstico** (comando não conseguiu verificar, por exemplo erro de acesso/rede), **falha de instalação**, ou **falha de compilação** (prebuild/Gradle com pré-requisitos aprovados). Mostrar item, esperado/observado, comando, fonte da matriz e ação concreta; exemplo: “JDK incompatível: esperado <matriz>; encontrado <versão>. Ajuste JAVA_HOME e PATH; execute check:env:android novamente.” Preservar log técnico da etapa sem segredos. Não chamar permissão/rede de versão inválida, não declarar sucesso por saída não interpretável e não instalar/aceitar licenças automaticamente no diagnóstico.

Validar em Windows/Linux com instalação limpa, logs do ambiente válido e casos isolados de executável ausente, Node/JDK fora da matriz, JAVA_HOME divergente, pacote Android ausente, SDK conflitante e comando de diagnóstico com falha. Usar fixtures de saída/execução controlada para negativos, sem desinstalar ferramentas da máquina. Conferir versões realmente usadas no CI e um build real; testes com fixtures não comprovam compilação. Emulador/dispositivo ausente não impede compilar APK, mas impede declarar smoke executado; documentar essa dependência separadamente.

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
- `check:env`: pré-requisitos JS; `check:env:android`: JS + toolchain nativa conforme seção 3.1; `check:expo`: diagnóstico compatível e checagem de versões; `export:android`: exportar bundle Android para diretório de artefatos.
- `build:android`: gerar projeto Android e APK de validação com JS embarcado; wrapper portável Node invoca Gradle/gradlew.bat, sem sintaxe Bash no contrato Windows.
- `validate`: manter todas as verificações atuais e agregar lint, tipos e testes JS. Exportação e build nativo em jobs explícitos, evitando mascarar seu custo e seus pré-requisitos no comando documental.

CI futuro em toda PR para main e push main: preservar checks documentais Linux/Windows; qualidade JS/diagnóstico/exportação em Linux com instalação por lock; smoke de instalação e scripts portáveis em Windows. Compilação Android em Linux com setup de JDK/SDK conforme matriz, prebuild regenerado, APK e relatório retidos por 7 dias. Cache npm por OS/Node/lock e Gradle por toolchain/lock, sem depender de cache para passar. Timeout inicial: 15 min qualidade e 30 min Android; calibrar com evidências.

Permissões `contents: read`, sem secrets em PR, sem `pull_request_target`, cancelamento por PR e ações com referências verificadas na implementação. Logs não contêm áudio privado. Na primeira implementação, todos os jobs abaixo são obrigatórios, inclusive para alterações documentais. Filtros futuros somente conforme política explícita a seguir; nesta revisão nenhum workflow é alterado.

#### Contrato do gate agregado

Inventário obrigatório por SHA/evento: documentação Linux, documentação Windows, qualidade JS (instalação/diagnóstico/lint/tipos/testes/exportação), smoke de scripts Windows e compilação Android (diagnóstico/prebuild/Gradle/artefato). Declarar dependências explícitas para cada job, incluindo todas as células documentais, e executar agregador com condição de status que permita avaliar dependências mesmo após failure/skipped/cancelled (por exemplo, `always()` no job; verificar semântica atual do Actions na implementação). Não confiar no sucesso implícito de job skipped pelo Actions nem usar continue-on-error/`|| true` para etapas exigidas.

- Todos os jobs exigidos `success`, com resultados completos no mesmo SHA/evento e artefato obrigatório presente: gate aprova e registra evidências.
- Qualquer `failure`, incluindo npm ci, lint, TS, Jest, exportação ou prebuild/Gradle: gate falha, identifica job/etapa e impede conclusão. Etapas posteriores skipped por dependência não compensam a falha original.
- Qualquer `cancelled`: gate não aprova. Se o agregador executar, falha e relata cancelamento. Se o workflow inteiro/agregador for cancelado, não há sucesso; exigir nova execução completa do SHA revisado. Execução antiga cancelada por novo commit não invalida o novo SHA nem aprova o antigo.
- Job exigido `skipped`, resultado ausente/desconhecido, job omitido de needs ou artefato obrigatório ausente: gate falha ao avaliar resultado final. Job queued/in_progress nunca conta como aprovado; o gate espera dependências terminarem. Agregador ausente/skipped também não é aprovação.
- Filtros futuros: workflow e agregador devem sempre ser disparados, sem paths no gatilho que impeça o gate de existir. Classificador obrigatório verifica lista completa entre base/head, incluindo adições/renomes/remoções; erro, paginação incompleta ou caminho desconhecido exige todos os jobs (fail closed). Allowlist documental explícita pode dispensar apenas jobs mobile, nunca checks documentais/classificação/gate. Código, manifests/lock, scripts, configuração ou workflows sempre exigem mobile. Se o classificador falhar, gate não aprova.
- Dispensa só é válida se política versionada e classificação bem-sucedida para o SHA/evento comprovam mudança estritamente documental, e o resultado esperado para cada job dispensado é skipped por essa condição. Gate registra “dispensado por filtro; não executado”, base/head e motivos, sem relatar testes/exportação/APK. Job exigido nunca é convertido em dispensado por ter falhado/cancelado/ficado ausente; execução solicitada e falha mesmo de job opcional não pode ser ignorada. Resultado inesperado é rejeitado.

Validar a política com casos completos: todos success; cada job exigido failure/cancelled/skipped/ausente; instalação/lint/TS/teste/exportação/build falhando; dispensa documental válida; filtro inválido/incompleto; gate não executado e workflow cancelado. Registrar cenário → entradas/resultados esperados → evidência. Um gate impedido de executar por cancelamento não consegue reportar failure sozinho: conclusão exige conferir seu check success no SHA final. Proteção do repositório será apenas recomendada nesta entrega; sem alterar branch protection não afirmar bloqueio técnico de merge já configurado. Documentar nomes estáveis para proteção; alteração de branch protection exige autorização específica, fora desta proposta. EAS opcional futuro não substitui rota local; quotas/custos Actions devem ser conferidos antes de ampliar matriz.

### 8. Rastreabilidade e documentação

- CA-01 → estrutura única, instalação e diagnóstico da spec; tarefas 1.1–1.4 e 2.1–2.2; matriz com fontes, logs Windows/Linux e negativos de pré-requisitos/instalação distintos de build.
- CA-02 → navegação mínima; tarefas 3 e 4; testes de ida/volta/Android e indisponibilidade.
- CA-03 → fronteiras/gates; tarefas 2 e 4; typecheck, lint, testes e provas negativas.
- CA-04 → offline/privacidade/estados e cenários com/sem operação assíncrona; tarefas 3.1–3.3 e 5.1–5.3; APK embarcado, modo avião, shell imediato, promessa controlada se aplicável e recuperação.
- CA-05 → gates/build e todos os cenários do gate agregado; tarefas 4.1–4.2, 5.1 e 6.1–6.4; logs de cada etapa, matriz de estados do gate, classificação/dispensa se futura e APK do SHA.
- CA-06 → reprodução/acessibilidade; tarefas 7; guia Windows/Linux, smoke Android e revisão documental.

A issue #11 permanece aberta e alinhada à arquitetura aprovada de app único; escopo, exclusões e CA-01…CA-06 são idênticos aos de proposal/spec. A decisão arquitetural não entrega implementação. Coordenar #14 (qualidade/CI) e demandas de design system/banco sem implementar seus escopos completos. Atualizar README, contexto, decisões, arquitetura e changelog na implementação para refletir o que realmente existir.

## Risks / Trade-offs

- [SDK/peers/JDK incompatíveis] → escolher matriz testada no primeiro incremento e registrar versões exatas antes de expandir o shell; parar/revisar se Node 24 não for suportado.
- [App único acumular acoplamento] → imports por fronteira, ciclos bloqueados e extração com consumidor comprovado; não converter preventivamente em monorepo.
- [Mocks ocultarem problemas nativos] → APK real separado da exportação e smoke Android, spike físico de áudio separado.
- [CNG perder alteração manual] → manter plugins/módulos como fonte e testar geração limpa sem remover arquivos do desenvolvedor.
- [CI lento ou com custo] → matriz mínima, cancelamento/cache, sem serviço recorrente obrigatório; medir duração real.
- [Proposta confundida com entrega] → tarefas abertas, ADR distinguindo aprovação arquitetural de implementação, issue não encerrada, sem sync/archive do delta.

## Migration Plan

Não há app nem dados de usuário para migrar. Somente após nova solicitação Apply, ampliar manifest existente de forma incremental, criar shell e checks no worktree, comparar com critérios e registrar evidências. Preservar licença e tooling. Reverter os commits da fundação restaura tooling documental, sem migração destrutiva; pacote instalado de validação pode ser desinstalado, sem dados reais nesta fase.

Esta PR é para revisão da proposta e permanece aberta. Não há restrição técnica que exija integrar planejamento antes de completar as tarefas. Quando autorizado separadamente, Apply deve continuar nesta branch/PR para que implementação, todas as tarefas, archive/sync autorizado e squash sigam o fluxo padrão. Se for desejado integrar apenas planejamento, isso exige discutir explicitamente o fluxo com o mantenedor; esta proposta não concede exceção nem autorização de merge.

## Open Questions

Somente detalhes não estruturais ficam para Apply: patch exato da matriz suportada, identificador Android de desenvolvimento e aparelho/AVD disponível para evidência do shell. Mudanças que alterem critérios, biblioteca central ou topologia exigem revisão da proposta.

## Referências verificadas em 26/10/2026

- [Expo monorepos](https://docs.expo.dev/guides/monorepos/): suporte e cuidados de resolução/módulos nativos duplicados.
- [TypeScript](https://docs.expo.dev/guides/typescript/): configuração base e aliases.
- [Development builds](https://docs.expo.dev/develop/development-builds/introduction/): binário próprio com bibliotecas nativas.
- [CNG](https://docs.expo.dev/workflow/continuous-native-generation/): fonte configurável e geração de projetos nativos.
- [Testes Jest](https://docs.expo.dev/develop/unit-testing/): preset jest-expo e mocks nativos.
- [SDK Manager Android](https://developer.android.com/tools/sdkmanager), [JDK Android](https://developer.android.com/build/jdks) e [matriz Gradle](https://docs.gradle.org/current/userguide/compatibility.html): comandos/componentes e compatibilidade a conferir para as versões fixadas; não usar automaticamente a versão mais recente da documentação.
- [Ambiente Expo](https://docs.expo.dev/get-started/set-up-your-environment/) e [upgrade de SDK](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/): consultar requisitos da versão selecionada no Apply.
- [Sintaxe Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax) e [expressões de status](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions): condições, dependências e resultados exigem avaliação explícita. A política fail closed acima é decisão do projeto.

App único é decisão do mantenedor para esta proposta; gates e adiamento de bibliotecas são planejamento para o estágio observado, não imposições dessas fontes. Versões e compatibilidade devem ser revalidadas no Apply.

## Estado do Apply

O mantenedor aprovou o plano e autorizou separadamente o Apply nesta conversa em 26/10/2026. A restrição original de planejamento descreve a etapa anterior; shell e gates estão em implementação/validação. Seguir tasks.md para evidência real e pendências, sem expandir escopo, declarar aceite integral ou executar archive/merge antecipados.
