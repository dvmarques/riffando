# Protocolo de validação física do afinador — GC-014 / issue #24

> **Estado em 29/10/2026:** protocolo **preparado**, nenhuma medição física executada. O afinador não existe no app (Apply não autorizado). Os limites numéricos abaixo são metas **propostas** pela change `implement-native-pitch-tuner` e só valem após aprovação do Apply. Não registre resultados sem observação real.

## Objetivo e limites

Medir, no **Galaxy S25 FE (Android 16)** com microfone embutido, a exatidão, a estabilidade, a rejeição e o custo do afinador nativo frente a um instrumento de referência. O resultado vale para esse aparelho, esse build e essas condições; não extrapole a outros aparelhos, microfones ou entradas USB. O benchmark sintético ([experiments/gc-014](../../experiments/gc-014/README.md)) não substitui este protocolo.

## Equipamento e pré-requisitos

| Item | Requisito | Registrar |
| --- | --- | --- |
| Aparelho | Samsung Galaxy S25 FE, Android 16 / API 36 | `getprop ro.product.model`, `ro.build.version.release`, `ro.build.version.sdk` |
| Build | APK de validação do CI no SHA a validar (artefato `android-validation`) ou `npm run build:android`; nunca Expo Go | SHA, origem do APK |
| Captura | Configuração efetiva exibida (48 kHz mono PCM16 preferencial; fonte `MIC`) | taxa, fonte, buffer; se ≠ 48 kHz, registrar e usar a faixa validada para essa taxa |
| Guitarra | Afinação padrão, cordas novas ou estabilizadas, sem capotraste | modelo, idade das cordas |
| Amplificador | Volume moderado, sem distorção, microfone do aparelho voltado ao alto-falante | modelo, ganho/volume, distância (50 cm e 1 m) |
| Referência 1 | Afinador de pedal/clip estroboscópico ou eletrônico com resolução ≤ 1 cent (ex.: estroboscópico) | modelo, calibração A4 = 440 Hz |
| Referência 2 (opcional) | Gerador de tons calibrado (arquivo/gerador externo) tocado pelo alto-falante para validar o viés do app sem a guitarra | fonte do tom, nível |
| Ambiente | Cômodo silencioso, ruído de fundo anotado (RMS exibido pela tela de diagnóstico da GC-013) | RMS de fundo (dBFS) |
| Evidência | Somente números, tabelas e capturas das métricas; **nenhum PCM salvo** nem anexado | — |

## Procedimento

Preencha uma linha por medição. “Leitura” é o valor estabilizado exibido; “Referência” é o valor do afinador externo no mesmo instante.

1. **Preparação.** Instalar com `adb install -r`, abrir o afinador, conceder a permissão apenas após tocar em iniciar. Registrar o ruído de fundo por 30 s.
2. **Gerador de tons (viés do app).** Para cada nota de 82,4 Hz (E2) a 523 Hz (C5) e, se a taxa efetiva for 48 kHz, até 988 Hz, tocar um tom puro com frequência exata a 1 m do aparelho por 10 s. Registrar leitura média e desvio. Isso isola o viés do algoritmo do viés da guitarra.
3. **Cordas soltas limpas.** Para cada uma das seis cordas, a 50 cm e a 1 m, volume moderado: palhetar, deixar soar 10 s e registrar ≥ 20 leituras estabilizadas ao longo de 10 s (ou a captura de tela a cada 0,5 s). Repetir 3 vezes por corda e distância.
4. **Desafinações controladas.** Em cada corda, desafinar para −40, −20, −10, +10, +20 e +40 cents (conferidos no estroboscópico) e registrar a leitura média; a direção Grave/Agudo e o ponteiro devem corresponder.
5. **Força de ataque.** Notas suaves e fortes (mesmas cordas, uma distância) e registrar RMS/pico da tela de diagnóstico, saturação e leituras.
6. **Troca de nota e tempo de estabilização.** Gravar em vídeo (240 fps, se disponível) a guitarra e a tela, trocar de E2→A2, A2→D3, D3→G3, G3→B3, B3→E4 e E4→E2. Medir, quadro a quadro, o tempo entre o ataque e a exibição estável da nota correta; mínimo de 5 repetições por troca.
7. **Vibrato.** Em A3 e E4, vibrato moderado (cerca de ±20–30 cents, 5 Hz): registrar comportamento (nota média estabilizada, estado instável) sem exigir ±5 cents.
8. **Harmônico natural e ponto de palhetada.** Harmônico natural do 12º traste das seis cordas (deve ler uma oitava acima) e palhetada próxima ao 12º traste (harmônicos ímpares fracos). Registrar leituras e se “oitava acima/abaixo” foi sinalizada.
9. **Silêncio, ruído e rejeição.** 30 s de silêncio; 30 s de ruído de TV/voz; acorde aberto; duas cordas juntas. Registrar quantas leituras “afinado” foram exibidas (esperado: 0 em silêncio e ruído; acorde/duas cordas apenas com ressalva documentada).
10. **Ruído moderado.** Reproduzir ruído de fundo a nível crescente com a guitarra em 1 m e registrar o nível em que a leitura deixa de ser exibida (esperado: rejeitar em vez de errar).
11. **Contínuo e ciclos.** 10 min de afinação contínua com a tela ligada (anotar aquecimento e consumo percebido) e 20 ciclos iniciar/parar (`adb logcat -d | grep -i riffando` sem exceção).
12. **Permissão e ciclo de vida.** Negar, conceder, revogar com a captura ativa, ir ao segundo plano e voltar: captura e eventos devem cessar, com retomada somente por toque; repetir com TalkBack e fonte ampliada.
13. **Custo.** Registrar o tempo por quadro de análise medido no código nativo (log amostrado, sem PCM) e a CPU observada (por exemplo `adb shell dumpsys cpuinfo`), sem converter isso em promessa.

## Critérios de aceitação propostos

| # | Critério (meta proposta; exploratória até aprovação) | Origem |
| --- | --- | --- |
| P1 | Passo 2: desvio absoluto entre a leitura e a frequência do tom ≤ 3 cents em todas as notas da faixa operacional da taxa efetiva (isola o viés do algoritmo) | CA-06/CA-07 |
| P2 | Passos 3–4: por corda, ≥ 90 % das leituras estabilizadas a até ±5 cents da referência, P95 do desvio absoluto ≤ 8 cents, em guitarra limpa com volume moderado; direção do ponteiro correta em todas as desafinações | CA-07 |
| P3 | Passo 6: tempo até a nota correta estável com mediana ≤ 200 ms e P95 ≤ 300 ms (a partir do ataque, medido em vídeo); registrar separadamente a parcela atribuível à captura | CA-06/CA-07 |
| P4 | Passo 8: nenhum erro de oitava exibido como “afinado”; harmônico natural lê oitava acima ou é sinalizado | CA-02/CA-03 |
| P5 | Passo 9: 0 leituras em silêncio; 0 “afinado” em ruído/voz | CA-02 |
| P6 | Passo 10: o afinador rejeita antes de exibir nota com erro > 50 cents | CA-02 |
| P7 | Passos 11–12: 10 min e 20 ciclos sem falha; recursos liberados em revogação/segundo plano | CA-01/CA-07 |
| P8 | TalkBack sem anúncio a cada evento; fonte ampliada sem perda de informação; alvos ≥ 48 dp | CA-04 |
| P9 | Offline (modo avião) 1 min; nenhum arquivo de PCM, upload ou telemetria | CA-08 |

Falha em P1–P3 não é contornada alterando a métrica: ajustar limiares, janela ou algoritmo (ver `design.md`) e repetir, ou reabrir a decisão com os números reais.

## Matriz de resultados (preencher com observações reais)

| Campo | Valor / evidência |
| --- | --- |
| Data, responsável | _pendente_ |
| Aparelho, Android/API | _pendente_ |
| SHA do build / APK | _pendente_ |
| Configuração de captura efetiva | _pendente_ |
| Referência utilizada e calibração | _pendente_ |
| P1 viés do app (gerador de tons) | _pendente_ |
| P2 exatidão por corda (50 cm / 1 m) | _pendente_ |
| P3 tempo de estabilização | _pendente_ |
| P4 oitava/harmônico natural | _pendente_ |
| P5 silêncio/ruído | _pendente_ |
| P6 ruído moderado | _pendente_ |
| P7 10 min / 20 ciclos / ciclo de vida | _pendente_ |
| P8 acessibilidade | _pendente_ |
| P9 offline/privacidade | _pendente_ |
| Custo por quadro / CPU | _pendente_ |
| Falhas, incertezas, limitações | _pendente_ |
