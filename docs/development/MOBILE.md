# Fundação mobile

## Estado e autorização

Apply autorizado pelo mantenedor após a proposta da PR #53. Shell em implementação/validação; nenhuma tarefa pendente pode ser considerada concluída por essa autorização. Não arquivar ou integrar enquanto houver tarefas abertas.

## Versões e pré-requisitos

Node 24.21.0, npm 12.2.1, Expo 58.0.19, React/React DOM 19.3.0, RN 0.88.0, TS 6.0.3. Java 17, Gradle 9.4.1, AGP 9.2.1, compileSdk 37, targetSdk 36, minSdk 24, build-tools 37.0.0, NDK 27.1.12297006, conferidos nos catálogos nativos instalados e CNG. config/toolchain.json é a matriz executável. Command-line tools 23.0 (arquivo 16111833) e pacote platforms;android-37.0 conferidos no repositório XML oficial; compileSdk continua 37.

Fontes: [Expo 58](https://expo.dev/changelog/sdk-58), [matriz Expo](https://docs.expo.dev/versions/v58.0.0/), [JDK Android](https://developer.android.com/build/jdks), [SDK Manager](https://developer.android.com/tools/sdkmanager) e catálogos das versões fixadas no lock. React DOM alinha peer do Router; não há app web. Nenhum JDK global foi alterado.

Windows PowerShell: Get-Command node,npm; Linux: command -v node e command -v npm. Confira node --version/npm --version antes dos scripts Node. Instale JDK 17/Android SDK pelos canais oficiais; alinhe JAVA_HOME, ANDROID_HOME, PATH e Gradle JDK do Android Studio. Command-line tools 23.0; o action instala no diretório cmdline-tools/16111833. ANDROID_CMDLINE_TOOLS_ROOT permite indicar outro diretório com source.properties da revisão exata, platform-tools, plataforma/build-tools/NDK da matriz; leia/aceite licenças aplicáveis. Não altere ferramentas de outros projetos.

## Comandos na raiz do worktree

Os comandos são portáveis entre PowerShell e Linux:

```bash
npm ci --ignore-scripts
npm run check:env
npm run validate
npm run check:expo
npm run export:android
npm run check:env:android
npm run android
npm start
npm run build:android
```

android instala development build; start usa Metro. build:android gera APK artifacts/riffando-validation.apk com JS embarcado, variante release assinada com chave debug do template apenas para validação interna; não publicar na loja. CNG/config/plugins são fonte: não editar android/ios gerados. Conferir regeneração em worktree limpo sem apagar trabalho local. iOS exige macOS/Xcode e não é entrega desta fundação.

## Diagnóstico e recuperação

check:env verifica versões Node/npm; check:env:android verifica Java/javac PATH/JAVA_HOME, raiz SDK, Android CLI -V/sdk list (ou shim sdkmanager legado), pacotes instalados, adb e evidência de licença. O build verifica JVM efetiva do Gradle antes de assemble. Diagnóstico não instala nem aceita licenças automaticamente.

Mensagens pt-BR distinguem pré-requisito ausente, incompatível e diagnóstico inconclusivo com comando/esperado/observado/correção. npm ci falhando é instalação; prebuild/Gradle após ambiente válido é compilação, sem declarar APK gerado. Falta de emulador impede smoke, não compilação. Windows local tem JDK 25 e nenhum Android SDK/AVD; diagnóstico o rejeita corretamente. Usar JDK 17 local isolado ou CI; não suprimir verificação. Fixtures de teste não comprovam ambiente/build real.

## Testes e evidências

Jest/RNTL/Router: navegação início/informações/retorno, abertura direta e erro injetado/recuperação com ações pt-BR, sem expor detalhes privados. Shell estático aparece imediatamente: sem loading/delay/operação fictícia. Não há regra musical nem banco. Lint bloqueia fronteiras (aliases/relativos) e ciclos; testes puros de tooling cobrem ambiente e gate, sem inventar domínio.

CI preserva documentação Linux/Windows, adiciona qualidade/exportação Linux, testes/scripts Windows, APK nativo e smoke AVD API 36 Pixel 7 x86_64 offline sem Metro. APK e evidência (screenshots/XML/modelo/OS/API/SHA/log) retidos por 7 dias. Smoke cobre reabertura, volta Android/ação e fontes 100%/200%; não comprova TalkBack, ainda pendente de avaliação manual.

Gate exige documentation (ambas as células), javascript, windows, android e emulator com success, sem filtros/continue-on-error. Failure/cancelled/skipped/ausência bloqueiam aprovação. Upload obrigatório falha sem APK. Gate/workflow ausente ou cancelado não equivale a sucesso. Branch protection não alterada; exigir o gate no SHA final é recomendação.

CA-01 → matriz/diagnóstico/instalação; CA-02 → navegação/smoke; CA-03 → lint/tipos/architecture.test.mjs; CA-04 → recovery.test.tsx e APK offline; CA-05 → gate.test.mjs e jobs/artefatos do SHA; CA-06 → guia/licenças e revisão de acessibilidade. Pendências e evidências reais em tasks.md/PR, sem afirmar áudio/USB/desempenho validados.

## Revisão independente de diagnóstico

O diagnóstico compara ANDROID_HOME/ANDROID_SDK_ROOT com sdk.dir em android/local.properties, antes e depois do prebuild. O CLI recebe --sdk explícito para listar o mesmo SDK do Gradle. Properties aceita espaços antes de chaves canônicas e rejeita duplicidade, continuação e escapes ambíguos com mensagem de correção; não assume silenciosamente a primeira chave. Gradle --version deve comprovar launcher e daemon compatíveis; critérios de daemon divergentes/inconclusivos são rejeitados. Casos negativos cobrem launcher 17/daemon 25 e SDK divergente. Revisão independente foi estática e não substitui build real.

O job Windows prepara JDK/SDK da matriz, regenera CNG e executa check:env:gradle para evidência real de SDK e JVM launcher/daemon. A compilação/execução do APK é validada pelo job Linux/AVD; não alegar compilação Windows ainda não executada.

## Smoke aprovado

Run [40412254969](https://github.com/dvmarques/riffando/actions/runs/40412254969), head dbdb777 e checkout de teste d0bbfe2: APK compilado e instalado em sdk_gphone64_x86_64, Android 16/API 36; modo avião/Metro desligado, início frio, navegação/retorno por ação e Back Android, reabertura e fontes 100%/200% aprovados. Capturas e XML revisados sem sobreposição visível; evidência não comprova TalkBack. Os [artefatos](https://github.com/dvmarques/riffando/actions/runs/40412254969/artifacts/12694691449) são retidos por 7 dias.

A política de #56 foi preservada: jobs não executam em PR Draft; ready_for_review dispara a validação integral, e main/manual continuam. Draft/skipped não comprova aprovação. O gate em Ready exige todos os jobs com success no SHA corrente.

## Gates nativos complementares

Windows executa check:env:gradle e build:android com APK próprio android-validation-windows. Linux, após build válido, injeta erro Kotlin somente no MainActivity.kt gerado, exige falha de compilação localizada, restaura os bytes originais em finally e recompila APK válido antes do upload. Log da prova fica no artefato; nenhuma regressão é commitada ou enviada ao usuário no APK. Cache Gradle usa o escopo isolado da PR. Confirmar resultados do SHA final antes de marcar essas tarefas.

## Revisão visual e contraste parcial

Capturas reais do smoke em 100% e 200% conferidas: conteúdo rolável, sem corte/colisão nas regiões capturadas e ações alcançadas pelo smoke. Contraste calculado das cores de produção: texto 10.71:1; texto raiz 12.03:1; título 16.65:1; ação 10.91:1; destaque 10.91:1. Action.tsx mantém mínimo de 52 dp e texto escalável. TalkBack/foco/anúncios confirmado manualmente pelo mantenedor, conforme registro abaixo.

## Correção da instalação Windows

O run 40442508770 rejeitou corretamente NDK ausente no Windows. O shim sdkmanager.bat da revisão 23.0 fragmentou identificadores com ponto e vírgula (log: Package ndk not found), apesar de retornar sucesso na instalação. O job passa a chamar android.exe diretamente, com raiz explícita e caminhos com barras, conforme [android sdk install](https://developer.android.com/tools/agents/android-cli/commands/sdk_install). O diagnóstico continua obrigatório e não foi relaxado; resultado positivo depende da nova execução.

## Acessibilidade manual confirmada

Em 27/10/2026, o mantenedor instalou o [APK do run 40443150983](https://github.com/dvmarques/riffando/actions/runs/40443150983/artifacts/12707632804) em Pixel 7 AVD Android 16/API 36 x86_64 Google Play no Windows. Confirmou início → informações → voltar com TalkBack, leitura dos controles e fonte 200% com ações alcançáveis. Capturas na conversa mostram foco verde; leitura audível/usabilidade são relato do mantenedor, sem gravação de áudio. O volume de acessibilidade precisou ser ajustado no emulador antes do teste. Complementa rótulos, contraste e smoke; não comprova áudio musical.

## CMake/Ninja no Windows

O run passou nos diagnósticos Windows, mas o build falhou em Ninja com Filename longer than 260 characters. Instalar CMake 3.31.6 (inclui Ninja 1.12.1) pelo SDK Manager e habilitar caminhos longos no Windows, conforme [guia Expo](https://docs.expo.dev/troubleshooting/windows-long-paths/). build:android passa android.cmakeVersion=3.31.6 somente no Windows. O diagnóstico verifica versões/política, sem instalar ferramentas nem alterar registro. O CI configura somente o runner descartável; nenhuma configuração global desta máquina foi alterada. Linux preserva sua configuração. Instalação, prebuild e diagnóstico Windows passaram; build corrigido aguarda nova evidência.

## Resultado consolidado e rastreabilidade

[Run 40522664541](https://github.com/dvmarques/riffando/actions/runs/40522664541), head a556c82ce2c9b3d157ce03049cb41b82e6b8c287: sete checks com success, incluindo documentação Linux/Windows, qualidade/exportação JS, build Windows e Linux, smoke offline e gate. Windows comprovou Java launcher/daemon 17.0.20.1, CMake 3.31.6/Ninja 1.12.1 e build em 12m59s; Linux repetiu a prova Kotlin negativa/restauração e recompilação. [APK Windows](https://github.com/dvmarques/riffando/actions/runs/40522664541/artifacts/12744265590), [APK Linux](https://github.com/dvmarques/riffando/actions/runs/40522664541/artifacts/12743252545) e [smoke](https://github.com/dvmarques/riffando/actions/runs/40522664541/artifacts/12742713294), retidos por 7 dias. Esse resultado supera as pendências de build descritas nas seções históricas acima; novas alterações continuam sujeitas ao CI do commit final.

Verificação da implementação (10 requisitos adicionados, 23 cenários; sem requisitos removidos/renomeados):

- App único/camadas e autorização: manifest/lock/tsconfig/ESLint e ADR; aprovação arquitetural foi separada de Apply, cujo registro consta na issue. Nenhum archive/merge decorre dessas aprovações.
- Instalação reproduzível: npm ci --ignore-scripts e prebuild nos dois sistemas, scripts Expo reais; matriz em config/toolchain.json. Windows local não foi compilado com o JDK 25 global.
- Diagnóstico: environment.test.mjs e check:env:gradle cobrem ausente/incompatível/inconclusivo e SDK/JVM divergentes; pré-requisito é verificado antes de Gradle; prova Kotlin distingue falha real de compilação após ambiente válido.
- Navegação: navigation.test.tsx e smoke cobrem ida/volta, retorno Android/ação e abertura direta. Nenhuma ferramenta musical disponível.
- Offline/privacidade: app.json e APK instalado, modo avião e Metro desligado; manifest sem áudio/USB e shell sem telemetria/upload/login.
- Estados/recuperação: recovery.test.tsx injeta falha e verifica recuperação; indisponibilidade e ausência de loading testadas. Não há operação assíncrona necessária no shell: cenário condicional não requer loader fictício.
- Acessibilidade/idioma: rótulos/ações em Jest, capturas/XML 100%/200%, contraste/alvos e teste manual TalkBack do mantenedor, registrado acima com sua origem.
- Fronteiras: architecture.test.mjs rejeita imports UI/nativo/infra/rotas por aliases e relativos; lint real mantém import/no-cycle e TS estrito. Sem pastas vazias para simular domínio futuro.
- Qualidade/build: logs separados de JS/exportação/compilação; provas negativas TS/navegação/fronteira e Kotlin revertidas; APK real e smoke não são apresentados como teste de áudio/USB/desempenho.
- Gate: gate.test.mjs e CI cobrem success/failure/cancelled/skipped/ausência; falha Windows anterior impediu aprovação real. Dispensa por filtros é contrato futuro condicionado, sem classificador ou filtros habilitados; nesta versão todos os jobs são exigidos. Cancelamento/global ou gate ausente não prova sucesso. Branch protection não foi alterada.

Revisão de coerência: app único, Expo Router, separação de camadas, dependências mínimas e assinatura interna seguem design/ADR; critérios CA-01…CA-06 e exclusões conferidos com a issue/proposal. Arquivos de navegação, recuperação, configuração, scripts de ambiente/build/gate/smoke e testes revisados. A revisão independente anterior foi estática e cobriu SDK/JVM; revisão atual e CI complementam essa evidência, sem atribuir ao revisor testes que não executou.

Limites conhecidos: aceite temporário de vulnerabilidades de tooling em DEPENDENCIES.md; não há inventário jurídico integral nativo ou publicação de loja nesta entrega. Os cenários condicionais de loading e filtros foram avaliados como condicionais, sem verificar funcionalidades inexistentes. Dez requisitos mapeados e cenários aplicáveis cobertos, sem lacuna técnica identificada nesta revisão. Archive/sync/merge não executados. A revalidação documental local e o CI do commit posterior continuam obrigatórios antes da integração.
