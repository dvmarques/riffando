# Design

## Context

A `main` do Riffando contém app único Expo 58/React Native, Expo Router, TypeScript estrito, CNG, CI Android Linux/Windows e smoke em emulador, mas nenhum motor de áudio. O `app.json` bloqueia RECORD_AUDIO. O spike integra-se à arquitetura de UI/features, domínio e infraestrutura da fundação sem criar monorepo.

Fontes: [issue #23](https://github.com/dvmarques/riffando/issues/23), [PRD](../../../../docs/product/PRD.md), [arquitetura](../../../../docs/architecture/ARCHITECTURE.md), [decisões](../../../../docs/DECISIONS.md), [matriz mobile](../../../../docs/development/MOBILE.md) e [políticas](../../../../AGENTS.md).

## Goals / Non-Goals

**Goals:** capturar amostras PCM Android realmente utilizáveis por um futuro analisador, estimar amplitude com parcimônia, sinalizar timestamps/erros honestamente, exercitar permissões/ciclo de vida e validar com guitarra em aparelho físico.

**Non-Goals:** extrair pitch, reconhecer notas, pontuar, garantir latência <5 ms, gravar PCM, selecionar USB, validar iOS ou implementar DSP C++. Nenhum dado de áudio pessoal será incluído em logs/artefatos por padrão.

## Decisions and alternatives (propostas; revisar no Apply)

### 1. API Android e integração Expo

- **Preferência:** `AudioRecord` em Kotlin, empacotado como módulo Expo local em `modules/riffando-audio`, descoberto pelo autolinking e regenerável por CNG. Permite leitura PCM direta, status do gravador e APIs de timestamp. Usar development build/APK, não Expo Go como evidência.
- **Alternativa:** `expo-av`/`expo-audio` voltados a gravação/reprodução são úteis para outras demandas, mas não assumir que disponibilizam PCM/timestamps/estado nativo necessários em tempo real, com semântica e controle equivalentes.
- **Alternativa C++/Oboe/AAudio:** avaliar depois de dados físicos de custo, latência e eventual processamento DSP; adicionar agora introduziria ABI, licenças e manutenção sem necessidade de análise de pitch nesta issue.

Config nativa: `RECORD_AUDIO` está em `blockedPermissions`; removê-la desse bloqueio e declarar a permissão necessária por configuração Expo/plugin verificável no manifest gerado. Não liberar câmera, USB, leitura de mídia ou permissões amplas. Solicitar em runtime somente quando o usuário escolher iniciar. Verificar que builds de CI apenas compilam o código sem usar microfone; execução física é gate separado.

### 2. Contrato mínimo e fluxo de dados

Contrato **conceitual**, detalhar tipos no Apply:

- `startCapture(): Promise<CaptureConfig>` — resolvido somente após permissão e início real ou rejeitado com erro categorizado.
- `stopCapture(): Promise<void>` — idempotente, libera captura/thread/buffers/observers.
- `getCaptureStatus(): Promise<CaptureStatus>` — `idle | requestingPermission | starting | recording | stopping | error`.
- `onCaptureMetrics(listener): Subscription` — entrega estatísticas com taxa limitada (ponto de partida até 5 eventos/s), permite cancelar na desmontagem.

As métricas incluem sample rate/encoding/channels efetivos, tamanho de buffer, frames observados, RMS em dBFS (não volume acústico calibrado), pico e proximidade de saturação. Reportar somente contagens sustentadas por leituras/códigos de erro e descontinuidades detectáveis; uma métrica de “buffers perdidos” exata requer comprovação específica. `AudioTimestamp` expõe `timestampOrigin: audio-record | unavailable` e o instante monotônico de observação. Um resultado do `AudioRecord` não deve ser tratado como prova independente de timestamp de hardware. Timestamps monotônicos não demonstram por si só latência de entrada ponta a ponta.

**Fluxo:** hardware → `AudioRecord.read` em worker dedicado → buffer bounded → medição de amplitude/frames no Kotlin → snapshot de métricas limitado → bridge Expo → UI. O JS não recebe array PCM por callback periódico. Não criar domínio musical vazio, DI container ou singleton React genérico sem consumidor real.

### 3. Formato, fonte e timing

Preferir PCM 16-bit mono e tentar 48 kHz; negociar fallback compatível após observar capacidades/erros de inicialização, registrando solicitado e efetivo. `AudioRecord.getMinBufferSize` é referência mínima, não garantia de latência; dimensionar buffer para estabilidade, fazer leitura contínua fora da UI e medir duração/erros observáveis. Testar `UNPROCESSED` somente quando `AudioManager.PROPERTY_SUPPORT_AUDIO_SOURCE_UNPROCESSED` ou teste explícito indicar suporte confiável; usar `MIC` de fallback. Não assumir que uma fonte desativa todo processamento em cada OEM. Não exigir 48 kHz se o dispositivo negociar outra frequência.

Usar `System.nanoTime` como base monotônica para eventos internos e `AudioRecord.getTimestamp(..., TIMEBASE_MONOTONIC)` quando a plataforma fornecer frames/timestamp válidos; documentar limites no startup e após reconfigurações. Relacionar contagem de frames e timestamp de captura, sem apresentar “latência de áudio” calculada apenas por subtração de tempos sem referência externa. O contrato futuro preserva possibilidade de processador DSP e iOS.

### 4. Estados, erros e privacidade

Iniciar somente por interação explícita. Em autorização negada: estado claro e opção para tentar novamente/abrir configurações quando necessário, sem pedir em loop. Ao sair do primeiro plano, perder permissão, ocorrer erro nativo, interrupção ou desmontar a tela: parar, liberar e comunicar em pt-BR; reinício exclusivamente manual. Tornar start/stop concorrentes seguros e idempotentes; fechar subscriptions e prevenir gravação residual após falha de inicialização. Não usar foreground service ou captura em background nesta fase.

Sem salvar ou transmitir PCM nem introduzir histórico/SQLite, rede, telemetria ou depuração contendo áudio. Guardar métricas somente em memória e evitar logs com conteúdo sensível; artefatos de teste podem conter screenshots de estado e números, não gravações. Acessibilidade: rótulos/estado legíveis no TalkBack, textos ampliados, contraste, controles com alvos adequados e medição não identificada apenas por cor.

### 5. Validação nativa e estratégia de teste

**Automatizados:** estados start/stop e corrida, recusa/revogação, limpeza de subscription, cenários de erro e formatação de métricas; testes de unidade Kotlin sobre transformação RMS/peak/contadores/estado com fonte sintética (sem afirmar que mock representa hardware); integração Expo/RN mockada onde necessário. Manter `npm run validate`, exportação Android, `check:expo`, APK Windows/Linux e CI existente. Examinar CNG/prebuild e permissões reais do manifest gerado; integrar testes Kotlin em job real se necessário (sem substituir compilação por teste vazio). Não alterar checks ou gatilhos silenciosamente.

**Android físico (gate manual):** registrar modelo, API/versão Android, tipo de microfone, entrada, build SHA e origem de APK, permissões efetivas, sample rate/encoding/buffers/timestamps, fonte de áudio e método; ambiente silencioso 30 s; guitarra amplificada em volume moderado 2 min; notas suaves/fortes/diferentes distâncias; captura contínua 10 min; 20 ciclos iniciar/parar; negar e revogar permissão; alternar primeiro/segundo plano; interferência de outro app quando reproduzível. Registrar resultados, interrupções, logs sanitizados e limites. Sem celular acoplado à execução do agente, solicitar execução manual ao mantenedor e marcar CA-08 pendente até evidência real.

**Análise:** comparar RMS do silêncio e estímulo, procurar saturação persistente, erros, instabilidade, perdas observáveis e uso de recursos sem declarar aprovação por limiar arbitrário. Aparelhos/OS diferentes podem se comportar de modo diverso. Emulador valida UI/build, **não** comprova microfone real, USB, latência nem desempenho. Se físico não estiver testado, implementação permanece incompleta e não pode ser arquivada/fechada.

### 6. Compatibilidade, riscos e decisões futuras

- Avaliar suportes de sample rate/fonte/AudioTimestamp e mapeamento exato de erros na versão Android real; registrar fallback observado.
- Mic pode captar processamento automático, ruído do ambiente e clipping da amplificação; nível de dBFS não equivale a dB SPL/qualidade musical.
- Risco de travamento por bloqueio da thread ou deadlock start/stop: testes de corrida e parada forçada, timeouts apenas quando justificáveis.
- PCM e buffers pertencem ao Kotlin nesta change. Futuro núcleo DSP C++/Swift é hipótese, não decisão final.
- USB e fallback ficam em #25; YIN/cents/confiança em #24; diagnóstico avançado de ruído em #26.
- Licenças PolyForm Noncommercial e dependências novas precisam verificação de versão, licença/NOTICE e inventário do APK; não adicionar biblioteca de áudio de terceiro sem necessidade real.
- Atualizar docs/DECISIONS.md e, se arquitetura estrutural mudar, ADR; separar resultado medido de intenção.

## Rastreabilidade e autorização

CA-01 permissões; CA-02 captura nativa; CA-03 buffers/cleanup; CA-04 timestamp; CA-05 UI; CA-06 ciclo de vida; CA-07 offline/privacidade/CI; CA-08 aparelho físico. As tarefas em [tasks.md](tasks.md) permanecem abertas até execução comprovada.

O refinamento e a proposta foram solicitados, e posteriormente o mantenedor autorizou **Apply em 28/10/2026**. O trabalho está na PR #60, em branch isolada. A implementação está em validação e não deve ser confundida com a comprovação de captura/latência no Android físico. **Archive/sync e merge não autorizados**; seguem Verify, revisão, CI e gates de `AGENTS.md`.
