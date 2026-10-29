# Proposal — GC-014: detecção de pitch e afinador

## Why

A [GC-014 / #24](https://github.com/dvmarques/riffando/issues/24), vinculada ao [EP-04 / #4](https://github.com/dvmarques/riffando/issues/4), deve transformar a captura PCM nativa concluída na GC-013 (#23, PR #60) na primeira capacidade musical utilizável. O diagnóstico atual mede amplitude, mas não reconhece altura musical.

## What Changes

**Decisões de produto aprovadas em 29/10/2026 (Propose, não Apply):**

- Afinador **cromático**, com modo **guitarra** de seis cordas em afinação padrão E2 A2 D3 G3 B3 E4.
- Detecção de pitch **nativa Android**, aproveitando o módulo Kotlin/AudioRecord existente; PCM permanece nativo.
- Interface com **nota grande, ponteiro visual e desvio em cents**.
- Primeira entrega **básica e confiável**, offline, usando microfone integrado e com validação física.

**Proposta funcional:** detecção monofônica de frequência fundamental, conversão Hz → nota/oitava/cents (A4=440 Hz fixo nesta etapa, hipótese de escopo), estimativa de confiança e supressão de resultados não confiáveis; modo guitarra permite selecionar uma das seis cordas como referência sem apresentar correspondência falsa quando a nota observada difere da corda-alvo. UI acessível em pt-BR com estados sem sinal, instável, captura negada/interrompida e erro. Analisar limitações de harmônicos, amplificador, ruído e oitavas.

## Fora do escopo

USB/seleção de dispositivos (#25), redução avançada de ruído (#26), afinações Drop D/personalizadas e referência A4 configurável (PRD RF-01, fases futuras), acordes/polifonia, treinador/onsets, metrônomo, C++/iOS, armazenamento/gravação, telemetria, backend, login e publicação.

## Evidência do refinamento técnico (29/10/2026)

Benchmark **sintético e determinístico** em Node ([experiments/gc-014](../../../experiments/gc-014/README.md), relatório gerado em `results/report.md`, 423 casos × 2 instantes, 11 categorias, 48 e 16 kHz). Compara YIN, autocorrelação normalizada refinada (MPM: picos-chave, k = 0,9, interpolação) e o baseline ingênuo anterior. **Não há medição em Android, microfone, Kotlin ou latência de ponta a ponta.**

## Decisões aprovadas × hipóteses técnicas

| Item | Estado | Base |
| --- | --- | --- |
| Afinador cromático + modo guitarra EADGBE, Android nativo, PCM nativo, nota grande/ponteiro/cents, offline, microfone embutido | **Decisão aprovada** (mantenedor, 29/10/2026, escopo de Propose) | Proposta original |
| Apply, arquitetura relevante, archive, PR de implementação, merge | **Não autorizados** | Autorizações separadas |
| Algoritmo inicial: MPM (NSDF + picos-chave, k = 0,9, interpolação parabólica); YIN como alternativa equivalente | Hipótese **suportada por evidência sintética**, pendente de aparelho | Relatório §1, §3, §5 |
| Janela 64 ms (3072 amostras a 48 kHz, escalada por ms), hop 20 ms | Hipótese suportada por evidência sintética | §3, §10 |
| Gate −50 dBFS RMS; confiança ≥ 0,90; K = 3 quadros, dispersão ≤ 50 c, mediana | Hipótese suportada por evidência sintética | §4, §6, §10 |
| Emissão ao JS ≤ 10 Hz, estado estabilizado retido (zero-order hold) | Hipótese suportada por evidência sintética | §10 |
| Faixa: 48 kHz = 73–988 Hz; 16 kHz = 73–523 Hz (784 Hz falha ±5 c); 44,1 kHz não testado | Hipótese; pendente de aparelho | §8, §9 |
| A4 = 440 Hz fixo | Hipótese de escopo (A4 configurável fica fora) | PRD RF-01 |
| Guarda de oitava 2τ | **Decisão do mantenedor (29/10/2026): fora do v1**; v1 apenas sinaliza “oitava acima/abaixo” da corda-alvo. Reavaliar após o passo 8 do protocolo físico | §5 |
| ±5 c em sinal limpo e estável; estabilização ≤ 300 ms; atualização ≈ 10 Hz | **Metas exploratórias**: viáveis nos sinais sintéticos; sem comprovação física | §1, §10 |

## Achados que limitam as promessas

- Sinais limpos, desafinados, cromáticos e de fundamental fraca: YIN e MPM leem 100 % dentro de ±5 c (mediana 1,3 c, P95 ≤ 1,8 c), contra 74 % do ACF de pico global, que comete erros de oitava.
- Parte do ≈ 1,3 c é viés de inarmonicidade do modelo sintético (B = 5·10⁻⁵); com B = 3·10⁻⁴ o viés sobe a 7,9 c e **nenhuma** leitura fica em ±5 c. O comportamento em cordas reais é desconhecido.
- Ruído moderado (SNR 10/5 dB): só 38–49 % de leituras corretas a 85 ms; o restante é rejeitado, sem nota errada aceita. Promessa de precisão não se aplica a ruído moderado.
- Vibrato: o erro frente à média instantânea da janela tem P95 de 5–12 c (±25/±50 c); frente ao centro nominal o P95 chega a 20–25 c (±25 c) e 30–49 c (±50 c) com janelas ≤ 85 ms. ±5 c não é alcançável durante vibrato.
- Erro de oitava **irredutível pelo período** quando os harmônicos ímpares ficam ≲ 20 % dos pares (corda tocada no ponto médio): YIN 48/48 e MPM 36/48 erram.
- Dueto/acorde: o semitom E4+F4 é aceito como nota única; o detector é monofônico e não identifica polifonia.
- A 16 kHz notas ≥ 784 Hz excedem ±5 c; faixa superior é condicionada à taxa efetiva.

## Critérios de aceite

Rastreabilidade completa (requisito da spec → tarefa → teste/evidência) em [tasks.md](tasks.md). Limites numéricos abaixo são **propostos** e passam a valer somente com aprovação do Apply.

- **CA-01** Ciclo de captura/análise: inicia e para sob ação explícita, com permissão contextual, reutiliza o `AudioRecord` da GC-013 (sem segundo gravador), libera recursos em parar/permissão/segundo plano; 20 ciclos iniciar/parar sem erro no aparelho.
- **CA-02** Frequência, nota, oitava, cents e confiança para sinais monofônicos; rejeição explícita (sem nota fictícia) para silêncio, ruído, baixa confiança e gate; 0 falsos positivos em silêncio digital, ruído ambiente −54 dBFS, ruído branco −30 dBFS e ruído marrom −35 dBFS nos testes determinísticos.
- **CA-03** Modo cromático (faixa operacional inteira) e modo guitarra com seis referências e corda-alvo; cents cromático e relativo à corda-alvo nunca se confundem; “oitava acima/abaixo” sinalizada.
- **CA-04** Tela pt-BR com nota grande, ponteiro, cents, Grave/Afinado/Agudo por texto, estados sem sinal/instável/não confiável/erro; TalkBack sem anúncio por evento; fonte ampliada sem perda de informação; alvos de toque ≥ 48 dp.
- **CA-05** DSP e PCM nativos; ponte de eventos ≤ 10/s, com `sessionId` e sequência; conversão Hz→nota/cents em domínio puro testável; sem dependência nova; iOS futuro não bloqueado.
- **CA-06** Testes determinísticos com paridade ao POC (mesmos vetores): em limpas/desafinadas/cromáticas/fundamental fraca/ruído leve na faixa operacional, ≥ 99 % aceitas dentro de ±5 c, P95 do |erro| ≤ 3 c, 0 erros de oitava; em ruído moderado nenhuma leitura aceita com erro > 50 c; estabilização em sequências sintéticas com emissão a 10 Hz: mediana ≤ 200 ms e P95 ≤ 300 ms; custo por quadro medido no Kotlin e registrado (sem limite prometido antes da medição).
- **CA-07** Validação no Galaxy S25 FE (Android 16) conforme [protocolo](../../../docs/development/TUNER_VALIDATION.md), com instrumento de referência: por corda, ≥ 90 % das leituras estáveis a até ±5 c do afinador de referência com guitarra limpa e volume moderado, P95 ≤ 8 c, nenhum erro de oitava aceito sem sinalização; 10 min contínuos e 20 ciclos sem falha; resultados, SHA, falhas e incertezas registrados, sem extrapolar a outros aparelhos. Falhar o gate físico **não** é ocultado: ajusta limites ou reabre a decisão de algoritmo.
- **CA-08** Sem upload, persistência de PCM ou telemetria; offline; `npm run validate`, `npm run check:expo`, testes Kotlin, APK e CI verdes no SHA final; licenças/dependências e documentação atualizadas.

## Capabilities

### New Capabilities

- `native-pitch-tuner`: análise de pitch monofônico e afinador visual no Android.

### Modified Capabilities

Nenhuma alteração de requisito da capability `native-pcm-capture` é prevista nesta proposta. A implementação reutilizará seu contrato; se a análise exigir mudar requisitos observáveis, adicionar delta explícito e submeter à revisão antes do Apply.

## Impact

Módulo Expo Android existente, adaptador TypeScript, domínio musical puro, tela/rota de afinador, testes Kotlin/JS, docs/DECISIONS.md, docs/development/, CHANGELOG.md e possível atualização da navegação. Sem migração de dados.

## Aprovação

Aprovados: o **refinamento e os artefatos OpenSpec** e, em **29/10/2026, o Apply** desta change pelo mantenedor, incluindo a decisão de **não incluir a guarda de oitava no v1**. **Archive, merge, release, alteração de arquitetura relevante e nova biblioteca seguem sem autorização.** Hipóteses pendentes estão na tabela acima. As metas ±5 cents, 300 ms e ≈ 10 Hz são exploratórias; só os sinais sintéticos as sustentam, e nada foi comprovado em Android físico.
