# Design — GC-014

## Contexto atual

A GC-013 implementou módulo Expo local em Kotlin com AudioRecord, captura PCM mono PCM16 (48 kHz preferencial), worker de leitura, controle de permissões/ciclo de vida, métricas RMS/pico e bridge de aproximadamente 5 eventos/s sem PCM em JS. Validação física registrada para Galaxy S25 FE Android 16; entrada MIC pode receber processamento do fabricante. Revisar implementação e assinaturas reais no início do Apply, evitando dois AudioRecord concorrentes.

## Decisões confirmadas

Afinador cromático e modo guitarra, Android nativo, nota grande + ponteiro + cents, escopo mínimo confiável e offline.

## Alternativas para detecção de pitch

Comparadas no [benchmark sintético](../../../experiments/gc-014/README.md) (Node, mesmo buffer, mesma faixa de lags 70–1000 Hz, mesmo custo assintótico O(W·τmax)):

1. **MPM — NSDF (autocorrelação normalizada) com seleção de picos-chave (primeiro pico ≥ 0,9 × máximo) e interpolação parabólica.** Recomendado como algoritmo inicial.
2. **YIN (diferença quadrática, CMNDF, limiar 0,2, interpolação parabólica).** Equivalente em limpas/desafinadas/cromáticas/fundamental fraca; inferior em ruído moderado (37,5 % × 48,6 % de recall a 85 ms; P95 12,7 × 4,3 c). Alternativa de menor risco de licença/ideia, mesma complexidade.
3. Autocorrelação de pico global (baseline): erros de oitava e de harmônico mesmo em sinal limpo (74 % ±5 c); descartada.
4. FFT/picos espectrais: não avaliada; máximo espectral não é a fundamental e exige janela maior e interpolação.
5. pYIN/C++/biblioteca: não justificado pela evidência; exige autorização arquitetural e avaliação de licença.

### Evidência sintética resumida (48 kHz, limiar de confiança 0,85, gate −50 dBFS; detalhes em `results/report.md`)

| Categoria | ACF global | YIN | MPM |
| --- | ---: | ---: | ---: |
| Limpas, desafinadas, cromáticas (n = 280) | 74 % | 100 % | 100 % |
| Fundamental fraca (n = 72) | 67 % | 100 % | 100 % |
| Ruído leve, SNR 20–30 dB (n = 72) | 81 % | 100 % | 100 % |
| Ruído moderado, SNR 5–10 dB (n = 72) | 24 % | 38 % | 49 % |
| Vibrato, vs. média instantânea (n = 72) | 78 % | 81 % | 81 % |
| Erro mediano / P95 (limpas) | 1,4 / 3,5 c | 1,3 / 1,5 c | 1,3 / 1,5 c |
| Falsos positivos em silêncio/ruído branco/marrom/ambiente | 2 | 0 | 0 |

Células = proporção de amostras aceitas dentro de ±5 c; rejeições contam como falha. A diferença YIN × MPM só aparece em ruído moderado e na fração de oitavas, não em sinais limpos.

### Solução recomendada (hipóteses técnicas; confirmar no aparelho)

| Parâmetro | Valor inicial | Justificativa/evidência |
| --- | --- | --- |
| Algoritmo | MPM: NSDF, k = 0,9, interpolação parabólica | Melhor em ruído moderado; custo ≤ YIN no Node |
| Janela | 64 ms (3072 amostras a 48 kHz = `round(fs·0,064)`), W = N − τmax − 1 | 100 % em sinais limpos já a 32 ms; 64 ms aproxima os ganhos de ruído de 128 ms e mantém a estabilização dentro do orçamento |
| Hop / sobreposição | 20 ms (≈ 69 %) | Resolução temporal da estabilização (50 quadros/s internos) |
| Faixa de busca | 70–1000 Hz | Cordas E2–E4 e cromático D2–B5 em 48 kHz |
| Faixa operacional anunciada | 48/44,1 kHz: 73–988 Hz (44,1 kHz não testado); 16 kHz: 73–523 Hz | A 16 kHz, 784 Hz e 988 Hz excedem ±5 c |
| Gate de nível | RMS da janela ≥ −60 dBFS; histerese: fechado, reabre acima de −57 dBFS | Ajustado após o teste rápido no aparelho (iniciais: −50 dBFS, 0,90, 3 consecutivos); ruído ambiente de −54 dBFS é rejeitado pela confiança, não pelo gate |
| Confiança | NSDF interpolado ≥ 0,75 (a 0,70–0,85 o recall sintético é igual e o FP em ruído é 0; ajustado de 0,90 após o teste no aparelho) | Ajustado após o teste rápido no aparelho (iniciais: −50 dBFS, 0,90, 3 consecutivos); ruído ambiente de −54 dBFS é rejeitado pela confiança, não pelo gate |
| Ataque | Subida de nível ≥ 6 dB sobre o mínimo dos últimos 5 quadros marca nota nova; os 10 quadros seguintes (≈ 0,2 s) não são lidos | Teste no aparelho (A2, referência 110,1 Hz): a leitura começava ≈ +16 cents e caía a ≈ 0 (cordas tocadas com força soam mais agudas logo após o ataque). Custo: a primeira leitura demora ≈ 0,4 s; a meta exploratória de 300 ms deixa de valer para a primeira leitura após o ataque |
| Refinação | Após o MPM, mede a fundamental por DFT com janela de Hann (±15 cents, 31 passos, interpolação parabólica em log); usada só se o pico superar 6× o entorno e ≥ 0,3× o maior entre harmônicos 2 e 3; senão mantém o período | Teste no aparelho: tom puro lido com erro ≈ 1 cent, mas E2 real lida ≈ +10 cents acima da referência (viés de inarmonicidade do período). Sintético (B = 3·10⁻⁴): viés 3,5 c → 0,0 c com fundamental forte; fundamental fraca recua ao período |
| Estabilização | 3 leituras aceitas entre os últimos 5 quadros, dispersão ≤ 50 c, mediana; tolera até 2 quadros rejeitados (≈ 40 ms) | Na tela: mediana das últimas 8 leituras (≈ 0,8 s), número atualizado a cada 400 ms, última leitura mantida em cinza como “Última leitura” até a próxima leitura ou parar |
| Emissão ao JS | Estado estabilizado retido, ≤ 10 eventos/s | P95 ≤ 200 ms em 10 Hz (K = 3, janela 64–85 ms); K = 5 chega a 250 ms |
| Erros de oitava | Sem guarda 2τ no v1; sinalização “oitava acima/abaixo” no modo guitarra | Ver abaixo |
| Eventos de estado | Sem sinal / instável / não confiável | Sem frequência ou nota fictícia |

**Erros de oitava.** Com harmônicos ímpares ≲ 20 % dos pares (corda tocada no ponto médio) o período aparente é T/2: YIN erra 48/48 e MPM 36/48. A guarda “adotar 2τ se o erro ali for < 50 % do erro em τ” corrige metade (r ≥ 0,1) sem afetar sinais limpos, mas desloca para f/2 sinais com dobra de período (2 → 16 erros em 36); a verdade musical desse segundo caso é ambígua. Para r ≤ 0,05 o erro é irredutível pelo período. **Decisão do mantenedor (29/10/2026): a guarda não entra no v1.** O v1 apenas sinaliza “oitava acima/abaixo” relativamente à corda-alvo, o que cobre os dois erros sem risco. A guarda só será reavaliada com os resultados do aparelho (passo 8 do protocolo: harmônico natural do 12º traste soa uma oitava acima e é leitura correta, não erro).

**Metas exploratórias.**

- ±5 c em sinal limpo e estável: **viável sinteticamente** (mediana 1,3 c, P95 1,5–1,8 c); inarmonicidade B = 3·10⁻⁴ gera viés de 7,9 c e **impede ±5 c**; alternativa se o aparelho confirmar viés: estimar a fundamental pela fase do primeiro parcial (não avaliado) ou relaxar a tolerância para ±8 c com texto explícito.
- Estabilização ≤ 300 ms: **viável no componente algorítmico** (P95 200 ms com emissão a 10 Hz, K = 3); o atraso real de entrada/saída do Android **não foi medido** e consumiria parte do orçamento.
- Atualização ≈ 10 Hz: viável; eventos nativos limitados a 10/s.
- Ruído moderado (SNR ≤ 10 dB): sem promessa de precisão; rejeitar e orientar.
- Vibrato: ±5 c inatingível; mostrar a média estabilizada, com texto de instabilidade se a dispersão exceder 50 c.

**Custo.** Em Node, MPM a 85 ms/48 kHz ≈ 3 ms por quadro e YIN ≈ 3,3 ms (não representa Kotlin nem o Galaxy S25 FE). Operações ≈ W·τmax MAC por quadro: 64 ms ⇒ ≈ 1,6 M MAC, ≈ 82 M MAC/s a 50 quadros/s. Decimação ou FFT não avaliadas; medir no aparelho antes de otimizar.

Introduzir C++ ou biblioteca externa exige autorização arquitetural específica.

## Fluxo proposto

AudioRecord PCM16 + timestamps monotônicos → buffer circular nativo limitado → janela/energia e pré-filtro conservador → análise monofônica de F0/qualidade → rejeição de sinal sem confiança → suavização com limite de atraso → evento estruturado e limitado → adaptador TS → UI. Nenhum frame PCM cru passa ao JS. Não presumir medição de latência ponta a ponta somente por timestamp.

## Contrato conceitual

`PitchEvent { sessionId, sequence, state, frequencyHz?, noteName?, octave?, cents?, confidence, observedAtMonotonicNs, windowMs, sampleRateHz }` (contrato ilustrativo; `state` ∈ {`reading`, `no-signal`, `unstable`, `unreliable`}; campos de leitura nulos fora de `reading`; unidades Hz/cents/ns; `sequence` crescente por sessão para descartar eventos tardios após stop/restart); representar resultados indisponíveis como estado `no-signal/unstable/unreliable` sem frequência/nome fictícios. O domínio musical converte frequência em semitons/cents com A4=440 Hz (hipótese de escopo); separar cifras (E2) e nomes pt-BR (Mi2), alinhando com GC-005/#15 e GC-039/#49 sem implementar seu escopo inteiro.

## Interface

Duas opções cromático/guitarra; guitarra exibe cordas E2 A2 D3 G3 B3 E4 e permite selecionar a corda-alvo; desvio da corda-alvo e desvio cromático não podem ser confundidos; nota grande; ponteiro centrado em 0 cents, limites e saturação visual identificados; texto explícito Grave/Afinado/Agudo sem depender apenas de cor; confiança insuficiente não mantém nota antiga como atual. Controles acessíveis, fonte ampliada, TalkBack sem anúncios de 5 vezes/segundo.

## Riscos e testes

Voz/ruído, ataques, decaimento, guitarra amplificada e harmônicos podem causar falsos positivos/erros de oitava; comparar tons sintéticos 70–1000 Hz (faixa inicial de teste, não faixa operacional garantida) e notas de cordas, incluindo níveis fracos/fortes. Janelas maiores melhoram a robustez a ruído e a resposta degrada; o protocolo de aparelho está em [TUNER_VALIDATION.md](../../../docs/development/TUNER_VALIDATION.md) (referência, distância/volume, séries, percentis, tolerâncias); medir CPU, atualização, variação em cents, eventos descartados e tempo de estabilização sem prometer limites universais. Testar concorrência, permissão negada/revogada, background e 20 ciclos iniciar/parar. Verificar em aparelho real e builds Android (Expo Go não comprova nativo). Sem armazenar gravações.

## Dependências e documentação

Reutilizar módulo atual, sem nova biblioteca antes de avaliar licenças/lock. Atualizar testes, documentação do módulo, decisões e changelog durante Apply. Build e testes completos no Verify, não inferir que foram executados no Propose.
