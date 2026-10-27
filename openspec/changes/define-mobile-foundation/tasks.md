# Tasks

Implementação futura de GC-001/#11. **Apply autorizado pelo mantenedor; implementação em andamento.** Topologia app único aprovada para planejamento em 26/10/2026; iniciar somente após nova solicitação Apply. Critérios CA-01…CA-06 em proposal.md; contratos na spec; evidências devem apontar comandos, SHA e resultados reais. Autorizações, archive e merge ficam no checklist da PR.

## 1. Matriz e instalação (CA-01)

- [x] 1.1 Selecionar SDK estável suportado e matriz Expo/React/RN/TS/Node/npm/JDK/Android SDK; registrar versões e licenças diretas/transitivas relevantes em guia de dependências, verificando fontes das versões e peers antes da adição.
- [x] 1.2 Ampliar manifest existente para app único e gerar lock sem perder tooling/override; verificar instalação limpa em Windows e Linux, diagnóstico Expo e ausência de React/RN nativos duplicados; documentar pré-requisitos e resolução de incompatibilidades.

- [ ] 1.3 Criar check:env/check:env:android conforme design 3.1, com comandos Node/npm/JDK/sdkmanager/adb/Gradle/Expo e matriz validada; verificar código não zero e mensagens pt-BR para ausência, incompatibilidade, diagnóstico inconclusivo, instalação e compilação, sem aceitar licenças ou alterar toolchain automaticamente.
- [ ] 1.4 Validar diagnósticos em Windows/Linux com logs reais positivos e casos controlados de executável/pacote ausente, versões inválidas, JAVA_HOME/SDK divergentes e erro do comando; documentar esperado/observado/fontes/correção e comprovar que não iniciam build em falha de pré-requisito.

## 2. Tipagem e fronteiras (CA-01, CA-03)

- [x] 2.1 Configurar TS estrito, aliases e lint de dependências/ciclos conforme design; verificar typecheck e lint no código efetivo, sem pacotes/diretórios vazios para representar features futuras.
- [x] 2.2 Verificar resolução consistente em Metro/Jest/TS/ESLint e rejeição de import proibido por alias e caminho relativo; registrar prova negativa revertida e documentar direção das dependências.

## 3. Shell e comportamento (CA-02, CA-04)

- [x] 3.1 Criar rotas início/informações com Expo Router e recursos pt-BR, retorno Android e indicação de recursos em preparação; incluir testes RNTL/Jest de ida/volta e indisponibilidade, verificando ações por nome/papel acessível.
- [x] 3.2 Adicionar recuperação de erro e testar shell imediato sem loading/delay artificial, indisponibilidade pt-BR e falha injetada/recuperação sem stack trace sensível ou debug publicado; apenas se houver operação assíncrona necessária, testar promessa controlada pendente → sucesso/erro e retirada do loader; documentar aplicabilidade sem criar operação fictícia.
- [x] 3.3 Verificar manifest/configuração sem microfone, USB, telemetria ou upload solicitados pelo shell; documentar distinção entre transporte de desenvolvimento e funcionamento offline do APK embarcado.

## 4. Testes e comandos JS (CA-03, CA-05)

- [x] 4.1 Configurar jest-expo/RNTL e scripts lint/typecheck/test/test:ci/check:expo/export:android reais; verificar suite não vazia, relatórios e exportação Android, documentando limites dos mocks.
- [x] 4.2 Agregar checks JS ao validate preservando todos os checks atuais; provar falha por erro TS, lint e teste de comportamento temporariamente quebrado, reverter regressões e registrar resultados.

## 5. Android e smoke (CA-04, CA-05)

- [ ] 5.1 Configurar CNG e development build, comandos start/android/build:android portáveis; verificar prebuild limpo e APK de validação com JS embarcado e assinatura interna de debug sem credenciais de loja, documentando execução Windows/Linux e rollback.
- [x] 5.2 Executar smoke do APK instalado: modo avião, Metro desligado, início a frio, navegação/voltar e reabertura; anexar SHA, artefato, aparelho/AVD e OS/API, passos/resultados e limitações sem alegar validação de áudio.
- [ ] 5.3 Verificar TalkBack, fonte Android 200%, alvos de toque e contraste conforme design; corrigir bloqueios e registrar evidência por tela e ambiente, complementando testes de rótulos/ações.

## 6. CI reproduzível (CA-05)

- [x] 6.1 Preservar matriz documental Linux/Windows e adicionar qualidade JS/diagnóstico/exportação e smoke Windows; verificar instalação por lock, relatórios, gates reais e permissão contents:read sem secrets em PR.
- [ ] 6.2 Adicionar compilação Android Linux com JDK/SDK documentados, cache/timeout e upload do APK por 7 dias; verificar CI do SHA com logs distintos para bundle e compilação nativa, incluindo falha controlada revertida do build.
- [x] 6.3 Definir gate agregado e nomes estáveis dos checks, validar success/failure/cancelled/skipped/ausência e artefato ausente dos jobs obrigatórios no mesmo SHA/evento e documentar configuração recomendada de proteção sem alterar branch protection nesta entrega.

- [x] 6.4 Verificar tabela de resultados do gate para falhas de instalação/lint/TS/testes/exportação/build, cancelamento global e gate ausente, mantendo todos os jobs exigidos na primeira implementação; documentar contrato/testes de dispensa futura por filtros e rejeição de classificação inválida/incompleta sem ativar filtros antecipadamente.

## 7. Integração, documentação e revisão (CA-06)

- [ ] 7.1 Consolidar README/guia de execução com comandos realmente executados em Windows/Linux, troubleshooting, versões/licenças e evidências Android; preservar a arquitetura aprovada no ADR/contexto/decisões/arquitetura e registrar apenas entregas efetivamente verificadas no CHANGELOG na versão em andamento com define-mobile-foundation/#11.
- [ ] 7.2 Conferir igualdade de escopo/exclusões/CA-01…CA-06 entre issue/proposal, cobertura integral pela spec e cada cenário contra tarefa/evidência, executar npm run validate, lint, tipos, testes, exportação e APK; revisar diff/código e registrar resultados, riscos restantes e CI verde sem declarar features fora do escopo como entregues.

## Evidências parciais do Apply — 26/10/2026

- 2.1/2.2: lint/typecheck aprovados; fronteiras rejeitam react-native, alias UI e relativos infra/rotas; dependência pura aceita. Alias também validado pelo Metro.
- 3.1/3.2: 2 suites Jest/RNTL, 3 cenários aprovados de navegação/abertura direta e erro/recuperação. Sem loading/delay fictício.
- 4.1: scripts reais, testes não vazios, cobertura informativa, Expo doctor 20/20 e exportação Android concluída.
- 65 casos tooling aprovados. Windows/Linux nos testes de ambiente são fixtures, não builds reais.
- Pendente: nativo/CI, smoke/acessibilidade, inventário/licenças e transitivas conforme docs/development/DEPENDENCIES.md. Sem archive/merge.

- 4.2: validate completo aprovado. Regressão TS (string atribuída a number) rejeitada com exit 2; ação de navegação inexistente rejeitada pelo Jest com exit 1. Alterações temporárias revertidas; testes voltaram a passar.

- 1.2: npm ci --ignore-scripts limpo em Windows, Node/npm fixados e check:env aprovados; instalação/qualidade/exportação Linux aprovadas no CI ee753f9 (run 40411290983). npm ls confirmou uma versão de React e uma de RN, sem duplicatas nativas.

- 3.3: CNG regenerado sem permissões de áudio/câmera/armazenamento/overlay/vibração solicitadas. Só INTERNET permanece para tooling; shell não contém telemetria, upload ou pedido de permissão. Dev server padrão limitado a localhost; APK offline ainda depende do smoke.

- 6.1: no run 40412254969, documentação Linux/Windows, qualidade/exportação Linux e instalação/scripts/testes Windows passaram no commit dbdb777; governança integrada sem perder seus checks.
- Revisão independente (arquitetura/diagnóstico, somente leitura) encontrou SDK efetivo e JVM daemon divergentes. Correções revisadas estaticamente pelo revisor e 69 casos tooling passaram, incluindo espaços/duplicidade de properties. Review não substitui CI ou TalkBack.

- 5.2: smoke do run 40412254969 aprovado em Android 16/API36 x86_64, offline/sem Metro, fonte 100%/200%, ida/volta Android/ação e reabertura. Capturas/XML/evidence.json revisados; TalkBack não executado.
- 6.3/6.4: gate real aprovou conjunto completo do mesmo run; tabela de estados failure/cancelled/skipped/queued/ausência e artefato ausente tem testes. Primeira implementação não permite filtro; contrato/testes de filtros futuros permanece documentado no design, sem bypass de skip. Branch protection preservada.
- Risco transitivo do tooling aceito temporariamente pelo mantenedor, conforme DEPENDENCIES.md, sem dispensar demais verificações.

- 1.1: matriz exata/peers conferidos no lock e catálogos, frameworks MIT upstream e 42 pacotes do JS avaliados; obrigações e limites de redistribuição em DEPENDENCIES.md. Não equivale a inventário nativo integral ou autorização de publicação.
