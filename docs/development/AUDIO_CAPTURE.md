# Captura PCM Android — GC-013 / issue #23

> **Estado em 28/10/2026:** implementação experimental na [PR #60](https://github.com/dvmarques/riffando/pull/60), sem medição física nem CI verificado neste registro. Não representa afinador disponível. Este guia documenta o código proposto, não comprova seu funcionamento em todos os aparelhos.

## O que o usuário poderá fazer

Na tela inicial, selecionar **Testar captura de áudio**. A tela de diagnóstico solicita permissão de microfone **somente após tocar em Iniciar captura**. O módulo Android local `modules/riffando-audio` usa `AudioRecord` para capturar PCM mono 16-bit em memória, preferindo 48 kHz e tentando 44,1 kHz e 16 kHz quando necessário. Seleciona `UNPROCESSED` apenas se informado como suportado e faz fallback para `MIC`; nenhum modo garante que o fabricante não processe o sinal.

A captura usa worker Kotlin e não transmite PCM bruto ao React Native. O worker conserva a sessão até liberar o gravador; durante o encerramento, novas capturas recebem erro recuperável em vez de competir pelo microfone. Um stop explícito aguarda a finalização do worker com limite, enquanto callbacks de background não bloqueiam a interface. Publica eventos limitados a cerca de 5/s com nível RMS/pico em **dBFS** (nível digital, não pressão sonora), indicação de amostras próximas à saturação, frames contados e metadados de tempo. O timestamp é solicitado via `AudioRecord.getTimestamp(..., TIMEBASE_MONOTONIC)`; a origem é informada como `audio-record` ou `unavailable`, sem chamá-lo de timestamp comprovadamente de hardware. A observação `System.nanoTime` também é monotônica, mas não prova latência de entrada. Não há contagem comprovada de underruns/overruns nem estimativa válida de latência ponta a ponta.

Não há armazenamento de amostras, gravação de arquivos, upload, IA externa, login ou servidor. A captura deve parar ao abandonar a tela, perder primeiro plano, negar/revogar permissão e em erros detectáveis. A retomada deve ocorrer somente após novo toque. O APK pode conter permissão `INTERNET` já existente na fundação; a captura não depende de rede.

## Requisitos e compilação

Conservar a matriz em [MOBILE.md](MOBILE.md). A configuração `app.json` declara `android.permission.RECORD_AUDIO` e deixa outras permissões sensíveis bloqueadas. O módulo é **local** (sem package/workspace próprio), com `expo-module.config.json` e plugin Gradle `expo-module-gradle-plugin`; a fonte é Kotlin em `modules/riffando-audio/android/src/main`.

Com Android Studio/JDK/SDK da matriz e instalação limpa, executar:

```bash
npm ci --ignore-scripts
npm run validate
npm run check:expo
npm run check:env:android
npm run build:android
cd android && ./gradlew :riffando-audio:testDebugUnitTest && node ../scripts/verify-pcm-junit.mjs
```

`build:android` gera APK interno com JS embarcado. Instalar em Android físico; usar Expo Go não valida módulos locais. Nunca inserir credenciais de distribuição nem publicar APK de validação como release. O CLI/SDK não deve ser atualizado automaticamente para resolver problemas desta change.

## Matriz de validação física obrigatória

**Preencher resultados reais antes de fechar a issue:**

| Campo | Valor / evidência |
| --- | --- |
| Modelo Android físico | Samsung Galaxy S25 FE (SM-S731B), aparelho do mantenedor (28/10/2026) |
| Android / API / fabricante | Android 16 / API 36 / Samsung |
| Microfone/entrada efetiva | Microfone embutido, fonte `MIC` ("Microfone padrão"); `UNPROCESSED` não foi selecionada, então pode haver processamento do fabricante |
| Commit SHA e APK instalado | `90d27e3`; APK `riffando-validation.apk` do artefato `android-validation` da run 40794999831, instalado via adb |
| Sample rate, encoding, source, buffer efetivos | 48000 Hz, mono PCM 16-bit, `MIC`, buffer nativo 19200 bytes |
| Timestamp de hardware disponível? | `AudioRecord` forneceu timestamp monotônico; não prova timestamp de hardware nem latência |
| Permissão concedida, negada, revogada | Negada: aviso pt-BR, sem captura. Concedida: captura iniciou. Revogada: pendente |
| Silêncio por 30 segundos | OK. Silêncio ambiente com portas fechadas: RMS −54,4 dBFS, pico −35,8, sem saturação; frames crescentes. Primeira leitura, com ruído ambiente: RMS −42,2, pico −22,5 |
| Guitarra amplificada, volume moderado, 2 minutos | OK (2 min, observação manual de prints pontuais, não de médias) |
| Notas suaves/fortes, distâncias diferentes, clipping | 50 cm: fraco RMS −10,0/pico −1,2; forte RMS −11,5/pico −0,4 (sem margem; saturação não marcada, limiar ≈ 0 dBFS). 1 m: fraco RMS −23,5/pico −12,8; forte RMS −9,5/pico −3,8. Sem sinal de compressão forte; 1 m deixa margem de ~4 dB |
| Captura contínua por 10 minutos | Pendente |
| 20 ciclos iniciar/parar | Pendente |
| Segundo plano/primeiro plano e saída da tela | Pendente |
| Outro aplicativo de áudio, se reproduzível | Pendente |
| Falhas, logs sanitizados, consumo percebido | Nenhuma falha observada nos testes feitos até aqui; logs não coletados |

Testar offline e, se possível, com TalkBack e fonte ampliada. O emulador CI serve para validar navegação, APK e início sem rede; não mede captura acústica real ou USB. **Não afirmar sucesso físico ou estabilidade antes de observar**. Dados PCM pessoais não devem ser anexados ao repositório público nem capturados por logs. Screenshots apenas de métricas não sensíveis e com permissão do mantenedor.

## Roteiro objetivo para o Android físico

Pré-requisitos: APK `riffando-validation.apk` do artefato `android-validation` do CI no SHA a validar (ou `npm run build:android`), aparelho com depuração USB, guitarra com amplificador e microfone do aparelho voltado ao amplificador. Nenhum PCM deve ser salvo; registre apenas números e capturas das métricas.

1. `adb install -r riffando-validation.apk`; anotar `adb shell getprop ro.product.model`, `ro.build.version.release` e `ro.build.version.sdk`. Abrir o app, entrar em **Diagnóstico de áudio** e confirmar que nenhuma permissão foi pedida antes de **Iniciar captura**.
2. Permissão: negar (esperar o aviso em pt-BR e nenhuma captura), iniciar de novo e conceder. Anotar "Configuração real" (entrada, frequência, buffer).
3. Silêncio, 30 s: RMS/pico próximos do piso, sem saturação, "Frames observados" crescente.
4. Guitarra amplificada em volume moderado, 2 min: notas suaves e fortes, em duas distâncias; anotar RMS/pico e se "Saturação detectada" aparece.
5. 10 min contínuos com a tela ligada; conferir que as métricas continuam atualizando e que o aparelho não aquece de forma anormal.
6. 20 ciclos Iniciar/Parar (o botão deve alternar sem erro; `adb logcat -d | grep -i riffando` sem exceções).
7. Segundo plano: durante a captura, ir para a tela inicial e voltar; a captura deve estar parada ao voltar (indicador de microfone do Android apagado em segundo plano).
8. Revogar a permissão em Configurações com a captura ativa; esperar o aviso de revogação e o estado "Captura indisponível".
9. Opcional: abrir outro app de áudio durante a captura e registrar o efeito; repetir com TalkBack e fonte ampliada.
10. Preencher a matriz abaixo com SHA, modelo/OS/API e resultados reais; só então marcar 4.3 e 4.4 em `tasks.md`.

Observação: o limiar de "Saturação detectada" (amostra ≥ 32760) é estrito; pico de −0,4 dBFS já está praticamente no teto e não foi marcado. Um aviso de "próximo da saturação" seria uma decisão de produto fora do escopo da GC-013.

## Limites e próximos passos

O estágio não identifica nota, cents ou afinação (#24), não seleciona USB (#25), não implementa redução avançada de ruído (#26), não executa DSP C++ nem valida iOS. A precisão do relógio e a diferença entre frames/tempo de notificação não bastam para medir latência real; nenhum alvo de jitter/precisão foi comprovado.

Ao concluir testes, atualizar este documento com valores observados e SHA, conferir `docs/DECISIONS.md`, tarefas OpenSpec, revisão de código e CI do commit final. Archive/sync e squash somente com autorização e com todas as tarefas concluídas.
