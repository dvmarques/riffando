# Fundação mobile — execução e evidências

## Estado

GC-001/#11 implementado em app único, com 20 tarefas verificadas na PR #53. Revisão Claude em 27/10/2026 tratou inconsistências de estado, Unicode e entrada real do gate. O mantenedor autorizou archive/sync e squash condicionados à revisão sem bloqueadores e CI verde no head final. Nenhum recurso musical, banco ou release de loja foi entregue. O estado dos gates fica na PR; as execuções citadas abaixo identificam exatamente os SHAs testados.

## Matriz e instalação

config/toolchain.json e package-lock.json são a matriz executável: Node **24.21.0**, npm **12.2.1**, Expo 58.0.19, React/DOM 19.3.0, RN 0.88.0, TS 6.0.3; JDK 17, Gradle 9.4.1, AGP 9.2.1, compileSdk 37, targetSdk 36, minSdk 24, build-tools 37.0.0, NDK 27.1.12297006. CLI Android 23.0, arquivo/diretório 16111833 e pacote platforms;android-37.0. Windows usa CMake 3.31.6/Ninja 1.12.1; Linux preserva o padrão da geração Expo.

O engines aceita Node 24 como família, mas check:env exige as versões **exatas** Node/npm acima. Um patch diferente pode instalar e ser corretamente rejeitado pelo diagnóstico. Se o Node vier com outro npm, instalar conscientemente a versão fixada (npm install --global npm@12.2.1), ou usar runtime isolado; os scripts não fazem essa alteração por conta própria.

Fontes: [Expo SDK 58](https://expo.dev/changelog/sdk-58), [matriz Expo](https://docs.expo.dev/versions/v58.0.0/), [JDK Android](https://developer.android.com/build/jdks), [SDK Manager](https://developer.android.com/tools/sdkmanager) e catálogos das versões no lock. Instalar JDK/SDK pelos canais oficiais; alinhar JAVA_HOME, ANDROID_HOME/ANDROID_SDK_ROOT, PATH e Gradle JDK do Android Studio. Ler/aceitar licenças aplicáveis. ANDROID_CMDLINE_TOOLS_ROOT permite indicar diretório que tenha source.properties da revisão exata.

No Windows, habilitar caminhos longos e instalar CMake/Ninja da matriz conforme [guia Expo](https://docs.expo.dev/troubleshooting/windows-long-paths/). build:android passa android.cmakeVersion=3.31.6 explicitamente; para expo run:android/Android Studio, configurar essa propriedade no Gradle user home conforme o mesmo guia. O CI configura apenas seu runner descartável, sem alterar esta máquina. Não editar módulos nativos/dependências para contornar o problema.

## Comandos no worktree

PowerShell: Get-Command node,npm; Linux: command -v node e command -v npm. Conferir node --version e npm --version antes dos scripts Node. Na raiz do worktree:

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

android executa a CLI Expo para development build; start inicia Metro em localhost. build:android faz prebuild, verifica SDK/JVM Gradle e assembleRelease, copiando artifacts/riffando-validation.apk com JS embarcado e assinatura debug interna. Sem credenciais de loja; não publicar esse APK. CNG/config/plugins são fonte, android/ios gerados são ignorados. CI parte de checkout sem android para provar geração limpa. Em árvore local existente, preservar alterações antes de qualquer prebuild --clean; nunca apagar trabalho do colaborador. Rollback é reverter os commits da fundação; não há dados reais ou migração nesta fase. iOS executável exige macOS/Xcode e fica fora da entrega.

## Diagnóstico e troubleshooting

check:env verifica Node/npm; check:env:android adiciona Java/javac de PATH/JAVA_HOME, SDK efetivo/local.properties, CLI/revisão/pacotes/ADB/licenças e CMake/Ninja/política Windows. check:env:gradle também confere launcher/daemon e critérios JVM. O SDK da CLI é explícito, e sdk.dir divergente é rejeitado antes da compilação. Valores Unicode e escapes padrão de Properties.store são decodificados; chaves ambíguas, duplicidade e continuação são rejeitadas. Não normaliza silenciosamente toolchain incompatível nem instala/aceita licenças automaticamente.

Mensagens pt-BR separam ausente/incompatível/inconclusivo, com esperado/observado/comando/correção. npm ci falhando é instalação; prebuild/Gradle após ambiente válido é compilação. Falta de emulador impede smoke, não compilação. No início desta tarefa o Windows local tinha JDK 25/sem SDK; o diagnóstico o rejeitou. O mantenedor instalou depois Android Studio/Pixel 7 para teste manual; os builds Windows documentados foram do runner CI, sem troca do JDK global do mantenedor.

Falhas reais corrigidas: shim sdkmanager.bat fragmentou identificadores no Windows (run 40442508770); substituído por android.exe sdk install com caminhos de pacotes por barras. Ninja antigo falhou em caminho >260 (run 40443150983); versões/política corrigidas e comprovadas no run 40522664541. Divergências SDK/JVM encontradas em revisão independente estática também ganharam regressões. Erro de rede/acesso não vira sucesso ou incompatibilidade falsa. Caminhos curtos/8.3 diferentes devem ser alinhados explicitamente às mesmas variáveis/SDK; não se afirma equivalência de todos os aliases de filesystem.

## Resultados de CI e APK

[Run 40522664541](https://github.com/dvmarques/riffando/actions/runs/40522664541), head a556c82ce2c9b3d157ce03049cb41b82e6b8c287: sete checks success — documentação Windows/Linux, qualidade/exportação, scripts/build Windows, build Linux, smoke AVD e gate. Windows: Java launcher/daemon 17.0.20.1, CMake 3.31.6/Ninja 1.12.1, BUILD SUCCESSFUL em 12m59s. Linux: erro Kotlin temporário em MainActivity.kt rejeitado, bytes restaurados em finally e APK válido recompilado. [APK Windows](https://github.com/dvmarques/riffando/actions/runs/40522664541/artifacts/12744265590), [APK Linux](https://github.com/dvmarques/riffando/actions/runs/40522664541/artifacts/12743252545) e [smoke](https://github.com/dvmarques/riffando/actions/runs/40522664541/artifacts/12742713294), retenção sete dias. Este run não é apresentado como validação de commits posteriores.

O smoke instala APK no AVD Android 16/API 36 x86_64, habilita modo avião, desliga wifi/dados, inicia a frio sem Metro, navega/volta por ação e Back Android, reabre com fontes 100%/200% e salva XML/PNG/evidence.json/logcat. Sha do evidence.json é o checkout de teste GITHUB_SHA (pode ser merge sintético); run e head são registrados separadamente. O campo TalkBack diz que não é coberto pela automação; o teste manual tem registro próprio abaixo.

**Limite de hardware:** Pixel 7 é AVD, não aparelho físico. O APK compila x86_64 e arm64-v8a, mas só x86_64 foi executado. A seleção de duas ABIs cobre o emulador de referência e um alvo ARM de compilação sem prometer execução física; armeabi-v7a e x86 de 32 bits foram excluídos desta validação. Não é avaliação de áudio/USB/latência/desempenho ou compatibilidade universal. Ícone/splash personalizados e publicação de loja são demandas futuras. A configuração padrão de backup precisa ser reavaliada antes de persistir dados reais, que o shell não possui. INTERNET permanece também no APK release; essa permissão não prova tráfego, e o shell não faz upload/telemetria ou requisição de rede obrigatória.

## Acessibilidade manual

Em 27/10/2026 o mantenedor instalou o [APK do run 40443150983](https://github.com/dvmarques/riffando/actions/runs/40443150983/artifacts/12707632804) no Pixel 7 AVD Android 16/API 36 x86_64 Google Play no Windows. Confirmou leitura/anúncios e início → informações → voltar com TalkBack, seguido do mesmo percurso com fonte 200% e ações alcançáveis. Capturas na conversa mostram foco verde; leitura audível/usabilidade são relato manual, sem gravação de áudio e sem atribuição ao CI/Claude. Foi necessário ajustar volume de acessibilidade no emulador.

Capturas reais do smoke em 100%/200% revisadas: conteúdo rolável sem colisão visível nas regiões capturadas, ações alcançadas. Action mantém mínimo de 52 dp e texto escalável. Contraste das cores de produção: texto 10.71:1; texto raiz 12.03:1; título 16.65:1; ação/destaque 10.91:1. Testes RNTL verificam nomes/papéis pt-BR e ações. O teste manual não é prova de funcionalidade de áudio musical.

## Gate e rastreabilidade

CI exige documentation (matriz completa), javascript, windows, android e emulator com success. O agregador compartilha essa lista com os testes e recebe toJSON(needs); o CLI real é executado em testes para sucesso e cada job ausente/failure/cancelled/skipped. Outros estados e diagnóstico são testados por função. Artefato ausente falha no upload/download obrigatório; a opção genérica artifactRequired de evaluateGate não é a verificação produtiva do artefato. Cancelamento/global ou gate ausente não prova aprovação. Draft não executa jobs; ready_for_review dispara todos. Não há filtros de arquivos/continue-on-error. Branch protection preservada; exigir o check estável Fundação — gate agregado é recomendação, não configuração já aplicada. Cache Gradle segue escopo de PR do Actions, sem pull_request_target ou secrets. Revisão não autoriza ampliar escrita de cache de fork na main.

Dez requisitos adicionados e 23 cenários revisados, sem remoções/renomes. Rastreabilidade CA-01…CA-06 e textos canônicos conferidos com issue/proposal:

- App único/camadas/autorização: manifest/lock/TS/ESLint/ADR. Aprovação de arquitetura é separada de Apply e dos gates finais.
- Instalação/diagnóstico (CA-01): npm ci/prebuild/ambientes reais Windows/Linux; environment.test.mjs, SDK/JVM e mensagens. Provas negativas não são apresentadas como builds reais.
- Navegação (CA-02): navigation.test.tsx e APK smoke cobrem ida/volta/Android/abertura direta e indisponibilidade.
- Fronteiras (CA-03): architecture.test.mjs rejeita UI/nativo/infra/rotas por aliases/relativos; lint real inclui import/no-cycle e TS estrito, sem pastas vazias para simular domínio.
- Offline/privacidade/recuperação (CA-04): app.json/APK em modo avião/sem Metro; recovery.test.tsx injeta e recupera erro sem detalhe privado. Não há operação assíncrona necessária, portanto nenhum loader fictício é exigido pelo cenário condicional.
- Qualidade/build/gate (CA-05): provas negativas TS/navegação/fronteiras/Kotlin revertidas; logs separados, APK e matriz do gate. Filtros são contrato futuro condicionado: sem classificador ou dispensa habilitados nesta versão.
- Reprodução/licenças/acessibilidade (CA-06): este guia, DEPENDENCIES.md, avisos e testes manuais/automatizados distintos. O aceite temporário de risco do tooling não é uma auditoria jurídica nativa ou autorização de loja.

## Revisão Claude e correções

Claude Code 2.1.304 / modelo configurado claude-sonnet-5-5 revisou estaticamente o head ca8f661, sem executar testes nem inspecionar lock completo. B1: estados contraditórios corrigidos nos próprios cabeçalhos, consolidando este guia. M1: Unicode/escapes Properties.store com testes; M2: jobs reais/lista compartilhada e entrada CLI do gate; M3: versões exatas explicitadas; M4: AVD/ABIs/32 bits explicitados; M5: TalkBack automatizado separado do relato manual. Suite após correções: 57 testes tooling, incluindo invocações reais do CLI, e três cenários UI. Contagens históricas anteriores não descrevem esse conjunto revisado. Revisão e testes do commit de correção, CI antes de archive e CI após archive continuam gates independentes.

O [run 40529243530](https://github.com/dvmarques/riffando/actions/runs/40529243530) aprovou os sete checks no head 6a8b62d, após as correções revisadas pelo Claude. Archive/sync foi efetuado na branch da PR após esse resultado; o commit de archive exige validação e CI próprios antes do squash.
