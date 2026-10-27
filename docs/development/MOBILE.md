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
