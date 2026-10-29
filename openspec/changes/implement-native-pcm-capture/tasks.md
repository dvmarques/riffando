# Tasks

GC-013 / issue #23 — `implement-native-pcm-capture`. **Apply autorizado em 28/10/2026; implementação parcial na PR #60.** Tarefas continuam abertas quando ainda exigem testes ou evidência física. Não há CI, OpenSpec Verify ou execução em Android físico comprovados neste registro. Referências CA-01…CA-08 em [proposal.md](proposal.md); gates de PR, archive e squash ficam fora deste checklist, conforme AGENTS.md.

## 1. Configuração, contrato e escolha de API (CA-01, CA-02, CA-04)

- [x] 1.1 Conferir SDK/Expo Modules API e requisitos de `AudioRecord` no Android alvo; registrar alternativa Kotlin versus biblioteca/Oboe, licenças, dependências, versão e consequências para iOS. Evidência: docs/development/AUDIO_CAPTURE.md, design.md, documentação oficial Expo/Android; sem biblioteca adicional.
- [x] 1.2 Implementar configuração Expo regenerável de `RECORD_AUDIO`, removendo apenas seu bloqueio atual; verificar permissão no manifest do APK e que não houve inclusão de permissões amplas; documentar consentimento e revogação. Evidência: `app.json`, teste native-audio-config e `dumpsys` do smoke CI (RECORD_AUDIO declarada, granted=false até ação do usuário).
- [x] 1.3 Definir tipos TypeScript de `CaptureConfig`, `CaptureStatus`, `CaptureMetrics` e erros categorizados, mantendo fronteiras de UI/infraestrutura e sem APIs de USB/pitch não usadas. Evidência: `src/infrastructure/audio/nativeCapture.ts`, typecheck CI.

## 2. Captura e temporização nativas (CA-02, CA-03, CA-04)

- [x] 2.1 Implementar módulo Expo local Kotlin usando `AudioRecord`, PCM mono 16-bit, frequência preferida e fallback verificado, com estado inicial/erro de formato e configuração efetiva observável. Evidência: Galaxy S25 FE usou 48 kHz mono PCM16, fonte `MIC`, buffer 19200 B e exibiu a configuração efetiva; CI compila o módulo. Fallback de formato/fonte não foi exercitado no aparelho.
- [x] 2.2 Implementar worker de captura e buffer limitado, contagem de frames e RMS/pico/clipping com unidades claras; enviar apenas métricas amostradas e erros, nunca PCM bruto contínuo ao JS. Evidência: PcmSignalAccumulatorTest (4) e métricas reais no aparelho (silêncio −54,4 dBFS; guitarra 2 min); somente métricas a ≤5 Hz chegam ao JS, sem PCM contínuo.
- [x] 2.3 Implementar timestamps monotônicos, uso condicional de `AudioTimestamp`, descrição de origem/indisponibilidade e testes controlados que impedem latência ou perdas fictícias. Evidência: CaptureLifecycleTest (timestamp indisponível não inventa valores; disponível vem inalterado do AudioRecord) e origem `audio-record` observada no aparelho; sem afirmação de latência ou timestamp de hardware.
- [x] 2.4 Implementar lifecycle e concorrência: start/stop idempotentes, permissão/revogação, falha de leitura, saída de foreground, desmontagem, subscriptions e liberação final sem captura de fundo. Evidência: CaptureLifecycleTest (start idempotente, bloqueio durante parada, 20 ciclos, concorrência da decisão), 20 ciclos e segundo plano no aparelho, testes Jest de permissão/AppState/AUDIO_STOPPING. Limites: docs/development/AUDIO_CAPTURE.md (lock compartilhado, revogação em primeiro plano fecha o app).

## 3. Interface técnica e testes automatizados (CA-01, CA-05, CA-06, CA-07)

- [x] 3.1 Implementar tela técnica de diagnóstico em pt-BR com start/stop, status, nível RMS/pico/clipping, configuração efetiva, timestamps/erros e acessibilidade; não representar afinador como funcional. Evidência: `AudioDiagnosticsScreen.tsx` e testes Jest; TalkBack físico segue em 4.4/docs.
- [x] 3.2 Testar estados e falhas na fronteira React Native/Expo, acessibilidade, permissões e recuperação; testes nativos controlados para RMS, buffers, temporização e corrida de lifecycle, diferenciando mocks de hardware. Evidência: Jest (14 testes: estados, permissão negada/NEVER_ASK_AGAIN, segundo plano, erro nativo, acessibilidade do alerta) e JUnit (10 testes, CI run 40805928617). Não há AudioRecord simulado no JVM; hardware real só no aparelho; TalkBack real pendente.
- [ ] 3.3 Validar configuração/permits e comportamento offline; confirmar que não há arquivos de PCM, upload, telemetria ou logs com dados sensíveis; atualizar inventário de dependências/licenças.

## 4. Compilação, dispositivo físico e evidências (CA-02…CA-08)

- [x] 4.1 Executar `npm run validate`, `npm run check:expo`, exportação Android e builds reais em Windows/Linux via CI, preservando gate agregado; registrar SHA, comandos, falhas e resultados. Evidência: CI 7/7 no SHA 90d27e3 ([run 40794999831](https://github.com/dvmarques/riffando/actions/runs/40794999831)), com Kotlin JUnit verificado e APK em Linux e Windows.
- [x] 4.2 Produzir APK interno com JS embarcado e validar início offline/emulador apenas como smoke de UI; diferenciar evidência simulada de execução de microfone real. Evidência: APK com JS embarcado e smoke offline no emulador API 36 (UI apenas; não é microfone real).
- [x] 4.3 Instalar no **Android físico do mantenedor** e registrar modelo/OS/API/entrada, build SHA e formato efetivo; testar silêncio por 30 s, guitarra com amplificador por 2 min, notas suaves/fortes, e distância/volume moderados, documentando níveis/clipping/timestamps. Evidência: Galaxy S25 FE (Android 16/API 36), SHA 90d27e3; matriz preenchida em docs/development/AUDIO_CAPTURE.md.
- [x] 4.4 Testar 10 min de captura contínua, 20 ciclos iniciar/parar, negar/revogar permissão, background/foreground e interferência quando reproduzível; registrar resultados, falhas e limites, sem alegar testes não realizados. Evidência: matriz em docs/development/AUDIO_CAPTURE.md (10 min, 20 ciclos, permissão negada, segundo plano). Limites: revogação em primeiro plano fecha o app (aviso pt-BR não exercitado); interferência de outro app não testada.

## 5. Revisão, documentação e alinhamento (CA-01…CA-08)

- [x] 5.1 Atualizar documentação de execução, segurança/privacidade, limitações do microfone, `docs/DECISIONS.md` e `CHANGELOG.md` na versão “Em andamento”; ADR se a implementação exigir alteração estrutural. Evidência: AUDIO_CAPTURE.md (matriz, limites), DECISIONS.md, GITHUB.md, CHANGELOG.md; sem ADR, pois não houve mudança estrutural.
- [ ] 5.2 Verificar coerência entre issue, proposta, specs, tasks, testes e evidências; executar OpenSpec Verify e revisão de código, corrigir achados, registrar o resultado final e limitações da CI/aparelho.
- [ ] 5.3 Preparar descrição da PR de implementação com rastreabilidade de cada CA, resultados, licenças, risco e evidências do Android físico; aguardar autorização de archive/sync, CI do commit final e merge por squash.
