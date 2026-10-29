# Tasks — GC-014

**Apply autorizado pelo mantenedor em 29/10/2026** (implementação até a PR; archive, merge e release seguem não autorizados). Refs #24, PR #61. Estado: implementação nativa e de interface escrita; testes Jest e de tooling executados localmente; **JUnit/Kotlin não pôde ser compilado neste executor (aguarda o CI) e nada foi medido em aparelho físico.** Rastreabilidade: **CA** em [proposal.md](proposal.md) → **Requisito** em [spec](specs/native-pitch-tuner/spec.md) → tarefa → teste/evidência. Protocolo físico: [TUNER_VALIDATION.md](../../../docs/development/TUNER_VALIDATION.md). Autorização, archive, merge e fechamento de issue ficam no checklist da PR (AGENTS.md).

## 1. Refinar e medir (CA-05, CA-06)

- [x] 1.1 Inspecionar o contrato e a implementação Kotlin atuais da GC-013 (assinaturas, worker, lock, ciclo de vida) e as specs permanentes. Evidência: `RiffandoAudioModule.kt` (um `AudioRecord`, worker `riffando-pcm`, lock de sessão, `decideStart`); integração aditiva: `startTuner`, evento `onPitch`, `sessionId`, conflito de modo `AUDIO_MODE_CONFLICT`; `startCapture` e o diagnóstico permanecem inalterados.
- [x] 1.2 Comparar YIN, autocorrelação refinada (MPM) e baseline em sinais sintéticos, definindo limiares e limitações reproduzíveis. Evidência: `experiments/gc-014/results/report.md` (`node experiments/gc-014/run-benchmark.mjs`), 423 casos, 11 categorias, janelas 32–128 ms, 48 e 16 kHz, sequências com estabilizador; testes `tests/tooling/gc-014-pitch-poc.test.mjs`. Limite: sintético; algoritmo final depende de 4.2.
- [x] 1.3 Contrato `PitchEvent` (estados, nulabilidade, `sessionId`, `sequence`), mapeamento Hz→nota/oitava/cents, nomes pt-BR/cifras e sinalização de oitava. Evidência: `src/infrastructure/audio/nativeTuner.ts`, `src/domain/tuning/*`, `tests/mobile/tuning-domain.test.tsx` (executado).

## 2. Motor nativo (CA-01, CA-02, CA-05, CA-06)

- [ ] 2.1 Integrar MPM (NSDF, k = 0,9, janela 64 ms, hop 20 ms, faixa 70–1000 Hz) ao worker nativo existente, sem segundo `AudioRecord` e sem PCM cru no JS. Estado: `MpmPitchDetector.kt`, `PitchPipeline.kt` e `RiffandoAudioModule.kt` escritos; teste estático `native-pitch-config.test.mjs` executado; `PitchPipelineTest` (paridade com o POC, |Δ| ≤ 0,5 c) **aguarda execução no CI**.
- [ ] 2.2 Gate −50 dBFS, confiança ≥ 0,90, estabilizador K = 3 (dispersão ≤ 50 c, mediana), estados e emissão ≤ 10 Hz. Estado: implementado em `PitchPipeline.kt`/módulo; comportamento antecipado por simulação Node idêntica ao algoritmo; JUnit **aguarda o CI**.
- [ ] 2.3 Testar sessão, interrupções, permissões, ciclo de vida, buffers e erro sem retenção de PCM; eventos tardios descartados por `sessionId`/`sequence`. Estado: filtro de sessão e UI testados em Jest (executados); ciclo de vida nativo e interrupções **dependem do CI e do aparelho**.
- [ ] 2.4 Registrar custo por quadro no Kotlin (ms/quadro no aparelho) e decidir, com evidência, se decimação/otimização é necessária. Estado: o evento `onPitch` já informa `analysisMicros` (média por quadro); **medição no aparelho pendente**.

## 3. Domínio e interface (CA-03, CA-04)

- [x] 3.1 Conversão F0 → nota/oitava/cents (A4 = 440 Hz) e sinalização “oitava acima/abaixo” da corda-alvo, com testes de limites. Evidência: `src/domain/tuning/notes.ts`, `guitar.ts` e `tests/mobile/tuning-domain.test.tsx` (executado).
- [x] 3.2 Seletor cromático/guitarra, corda-alvo e UI de nota grande, ponteiro, cents e estados, sem confundir cents cromático e relativo à corda. Evidência: `src/features/tuner/TunerScreen.tsx`, `useTuner.ts`, rota `app/afinador.tsx`; `tests/mobile/tuner-screen.test.tsx` (9 testes, executados: permissão, estados, sessão, guitarra, oitava, leitura obsoleta, erro nativo).
- [ ] 3.3 Validar atualização, TalkBack (sem anúncio por evento), fonte ampliada, alvos de toque ≥ 48 dp e offline em aparelho (Req. “Feedback visual”).

## 4. Verificação (CA-01…CA-08)

- [ ] 4.1 Testes determinísticos Kotlin/TS com os vetores do POC por categoria; registrar tolerâncias e métricas agregadas (CA-06: ≥ 99 % em ±5 c e P95 ≤ 3 c em limpas/desafinadas/cromáticas/fundamental fraca/ruído leve; 0 erros de oitava nelas; ruído moderado sem leitura aceita com erro > 50 c).
- [ ] 4.2 Executar o [protocolo físico](../../../docs/development/TUNER_VALIDATION.md) no Galaxy S25 FE (Android 16) com referência externa: seis cordas, desafinações, distâncias/volumes, vibrato, harmônico natural, 10 min, 20 ciclos, permissão/segundo plano. Registrar SHA, método, falhas e incertezas (CA-07). Se o gate físico falhar, reabrir a decisão de algoritmo/limiares antes de concluir.
- [ ] 4.3 Executar `npm run validate`, `npm run check:expo`, testes Kotlin e build Android; verificar CI no SHA final (CA-08).
- [ ] 4.4 Revisar licenças, privacidade (sem upload, PCM ou telemetria), arquitetura, `docs/DECISIONS.md`, `CHANGELOG.md`, `docs/development/AUDIO_CAPTURE.md` e limitações; revisão técnica do diff.

> Não iniciar tarefas de Apply antes de autorização explícita. Archive/sync e squash requerem gates e autorizações posteriores.
