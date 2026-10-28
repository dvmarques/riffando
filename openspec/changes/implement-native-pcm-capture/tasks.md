# Tasks

GC-013 / issue #23 — `implement-native-pcm-capture`. **Apply autorizado em 28/10/2026; implementação parcial na PR #60.** Tarefas continuam abertas quando ainda exigem testes ou evidência física. Não há CI, OpenSpec Verify ou execução em Android físico comprovados neste registro. Referências CA-01…CA-08 em [proposal.md](proposal.md); gates de PR, archive e squash ficam fora deste checklist, conforme AGENTS.md.

## 1. Configuração, contrato e escolha de API (CA-01, CA-02, CA-04)

- [x] 1.1 Conferir SDK/Expo Modules API e requisitos de `AudioRecord` no Android alvo; registrar alternativa Kotlin versus biblioteca/Oboe, licenças, dependências, versão e consequências para iOS. Evidência: docs/development/AUDIO_CAPTURE.md, design.md, documentação oficial Expo/Android; sem biblioteca adicional.
- [ ] 1.2 Implementar configuração Expo regenerável de `RECORD_AUDIO`, removendo apenas seu bloqueio atual; verificar permissão no manifest do APK e que não houve inclusão de permissões amplas; documentar consentimento e revogação.
- [ ] 1.3 Definir tipos TypeScript de `CaptureConfig`, `CaptureStatus`, `CaptureMetrics` e erros categorizados, mantendo fronteiras de UI/infraestrutura e sem APIs de USB/pitch não usadas.

## 2. Captura e temporização nativas (CA-02, CA-03, CA-04)

- [ ] 2.1 Implementar módulo Expo local Kotlin usando `AudioRecord`, PCM mono 16-bit, frequência preferida e fallback verificado, com estado inicial/erro de formato e configuração efetiva observável.
- [ ] 2.2 Implementar worker de captura e buffer limitado, contagem de frames e RMS/pico/clipping com unidades claras; enviar apenas métricas amostradas e erros, nunca PCM bruto contínuo ao JS.
- [ ] 2.3 Implementar timestamps monotônicos, uso condicional de `AudioTimestamp`, descrição de origem/indisponibilidade e testes controlados que impedem latência ou perdas fictícias.
- [ ] 2.4 Implementar lifecycle e concorrência: start/stop idempotentes, permissão/revogação, falha de leitura, saída de foreground, desmontagem, subscriptions e liberação final sem captura de fundo.

## 3. Interface técnica e testes automatizados (CA-01, CA-05, CA-06, CA-07)

- [ ] 3.1 Implementar tela técnica de diagnóstico em pt-BR com start/stop, status, nível RMS/pico/clipping, configuração efetiva, timestamps/erros e acessibilidade; não representar afinador como funcional.
- [ ] 3.2 Testar estados e falhas na fronteira React Native/Expo, acessibilidade, permissões e recuperação; testes nativos controlados para RMS, buffers, temporização e corrida de lifecycle, diferenciando mocks de hardware.
- [ ] 3.3 Validar configuração/permits e comportamento offline; confirmar que não há arquivos de PCM, upload, telemetria ou logs com dados sensíveis; atualizar inventário de dependências/licenças.

## 4. Compilação, dispositivo físico e evidências (CA-02…CA-08)

- [ ] 4.1 Executar `npm run validate`, `npm run check:expo`, exportação Android e builds reais em Windows/Linux via CI, preservando gate agregado; registrar SHA, comandos, falhas e resultados.
- [ ] 4.2 Produzir APK interno com JS embarcado e validar início offline/emulador apenas como smoke de UI; diferenciar evidência simulada de execução de microfone real.
- [ ] 4.3 Instalar no **Android físico do mantenedor** e registrar modelo/OS/API/entrada, build SHA e formato efetivo; testar silêncio por 30 s, guitarra com amplificador por 2 min, notas suaves/fortes, e distância/volume moderados, documentando níveis/clipping/timestamps.
- [ ] 4.4 Testar 10 min de captura contínua, 20 ciclos iniciar/parar, negar/revogar permissão, background/foreground e interferência quando reproduzível; registrar resultados, falhas e limites, sem alegar testes não realizados.

## 5. Revisão, documentação e alinhamento (CA-01…CA-08)

- [ ] 5.1 Atualizar documentação de execução, segurança/privacidade, limitações do microfone, `docs/DECISIONS.md` e `CHANGELOG.md` na versão “Em andamento”; ADR se a implementação exigir alteração estrutural.
- [ ] 5.2 Verificar coerência entre issue, proposta, specs, tasks, testes e evidências; executar OpenSpec Verify e revisão de código, corrigir achados, registrar o resultado final e limitações da CI/aparelho.
- [ ] 5.3 Preparar descrição da PR de implementação com rastreabilidade de cada CA, resultados, licenças, risco e evidências do Android físico; aguardar autorização de archive/sync, CI do commit final e merge por squash.
