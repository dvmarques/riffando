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
| Modelo Android físico | Pendente |
| Android / API / fabricante | Pendente |
| Microfone/entrada efetiva | Pendente |
| Commit SHA e APK instalado | Pendente |
| Sample rate, encoding, source, buffer efetivos | Pendente |
| Timestamp de hardware disponível? | Pendente |
| Permissão concedida, negada, revogada | Pendente |
| Silêncio por 30 segundos | Pendente |
| Guitarra amplificada, volume moderado, 2 minutos | Pendente |
| Notas suaves/fortes, distâncias diferentes, clipping | Pendente |
| Captura contínua por 10 minutos | Pendente |
| 20 ciclos iniciar/parar | Pendente |
| Segundo plano/primeiro plano e saída da tela | Pendente |
| Outro aplicativo de áudio, se reproduzível | Pendente |
| Falhas, logs sanitizados, consumo percebido | Pendente |

Testar offline e, se possível, com TalkBack e fonte ampliada. O emulador CI serve para validar navegação, APK e início sem rede; não mede captura acústica real ou USB. **Não afirmar sucesso físico ou estabilidade antes de observar**. Dados PCM pessoais não devem ser anexados ao repositório público nem capturados por logs. Screenshots apenas de métricas não sensíveis e com permissão do mantenedor.

## Limites e próximos passos

O estágio não identifica nota, cents ou afinação (#24), não seleciona USB (#25), não implementa redução avançada de ruído (#26), não executa DSP C++ nem valida iOS. A precisão do relógio e a diferença entre frames/tempo de notificação não bastam para medir latência real; nenhum alvo de jitter/precisão foi comprovado.

Ao concluir testes, atualizar este documento com valores observados e SHA, conferir `docs/DECISIONS.md`, tarefas OpenSpec, revisão de código e CI do commit final. Archive/sync e squash somente com autorização e com todas as tarefas concluídas.
