# GC-014 — Relatório do benchmark sintético (gerado por `run-benchmark.mjs`)
Referência: 48000 Hz, janela de 85 ms, gate de nível -50 dBFS (RMS da janela), limiar de confiança 0.85 para todos os algoritmos. Intervalo de busca 70–1000 Hz. Sinais determinísticos (PRNG com sementes fixas), PCM16 simulado; cada caso é avaliado em dois instantes (0,30 s e 0,45 s). **Nada aqui foi medido em Android ou com microfone.**

## 1. Resultados por categoria (48 kHz, 85 ms)
Células: **±5 c** = taxa de leituras aceitas com |erro| ≤ 5 cents sobre todas as amostras da categoria · mediana/P95 do |erro| (cents) entre as leituras aceitas com nota correta (|erro| ≤ 50 c). Leituras rejeitadas (gate ou baixa confiança) contam como não detectadas.

| Categoria | n | ACF global (baseline) | YIN | MPM (ACF refinada) |
|---|---:|---:|---:|---:|
| 01 cordas soltas limpas | 48 | 83.3% · 1.4/3.4 | 100.0% · 1.3/1.5 | 100.0% · 1.3/1.5 |
| 02 desafinadas | 192 | 77.1% · 1.3/3.5 | 100.0% · 1.3/1.5 | 100.0% · 1.3/1.5 |
| 03 faixa cromática | 40 | 50.0% · 2.1/6.2 | 100.0% · 1.3/1.6 | 100.0% · 1.3/1.5 |
| 04 fundamental fraca | 72 | 66.7% · 1.1/1.4 | 100.0% · 0.7/0.7 | 100.0% · 0.7/0.7 |
| 05 ruído leve | 72 | 80.6% · 1.4/3.4 | 100.0% · 1.3/1.8 | 100.0% · 1.3/1.7 |
| 05 ruído moderado | 72 | 23.6% · 1.6/6.4 | 37.5% · 2.7/12.7 | 48.6% · 1.8/4.3 |
| 06 baixa amplitude | 120 | 38.3% · 1.4/5.9 | 50.0% · 1.4/8.7 | 56.7% · 1.3/5.0 |
| 07 vibrato | 72 | 77.8% · 2.8/9.6 | 80.6% · 2.0/10.7 | 80.6% · 2.0/10.5 |
| 08 oitava: ímpares fracos | 48 | 83.3% · 1.4/3.4 | 0.0% · —/— | 25.0% · 1.0/1.0 |
| 08 oitava: dobra de período | 36 | 33.3% · 1.4/1.4 | 94.4% · 1.5/2.1 | 94.4% · 1.3/1.5 |
| 09 inarmonicidade alta | 24 | 8.3% · 7.4/12.0 | 0.0% · 7.9/8.5 | 0.0% · 7.9/8.5 |

### Falhas e rejeições por categoria (YIN | MPM | ACF baseline)
`rej` = rejeitadas por baixa confiança; `gate` = abaixo do gate de nível; `oit` = erro de oitava; `harm` = harmônico/subharmônico não oitava; `outro` = demais erros > 50 c.

| Categoria | YIN: rej/gate/oit/harm/outro | MPM (ACF refinada): rej/gate/oit/harm/outro | ACF global (baseline): rej/gate/oit/harm/outro |
|---|---:|---:|---:|
| 01 cordas soltas limpas | 0/0/0/0/0 | 0/0/0/0/0 | 0/0/8/0/0 |
| 02 desafinadas | 0/0/0/0/0 | 0/0/0/0/0 | 0/0/28/16/0 |
| 03 faixa cromática | 0/0/0/0/0 | 0/0/0/0/0 | 0/0/4/14/0 |
| 04 fundamental fraca | 0/0/0/0/0 | 0/0/0/0/0 | 0/0/12/12/0 |
| 05 ruído leve | 0/0/0/0/0 | 0/0/0/0/0 | 0/0/14/0/0 |
| 05 ruído moderado | 36/0/0/0/0 | 36/0/0/0/0 | 36/0/13/3/0 |
| 06 baixa amplitude | 24/24/0/0/0 | 24/24/0/0/0 | 24/24/17/3/0 |
| 07 vibrato | 0/0/0/0/0 | 0/0/0/0/0 | 0/0/0/0/0 |
| 08 oitava: ímpares fracos | 0/0/48/0/0 | 0/0/36/0/0 | 0/0/8/0/0 |
| 08 oitava: dobra de período | 2/0/0/0/0 | 0/0/2/0/0 | 0/0/24/0/0 |
| 09 inarmonicidade alta | 0/0/0/0/0 | 0/0/0/0/0 | 0/0/0/0/0 |

## 2. Silêncio, ruído e sinais ambíguos (48 kHz, 85 ms)
Contagem de leituras **aceitas** (falsos positivos para silêncio/ruído; para sinais tonais/polifônicos indica apenas que o detector monofônico produziu uma nota). n = 2 instantes × sementes.

| Sinal | n | ACF global (baseline): aceitas | YIN: aceitas | MPM (ACF refinada): aceitas |
|---|---:|---:|---:|---:|
| silêncio digital | 2 | 0 | 0 | 0 |
| ruído ambiente −54 dBFS | 8 | 0 | 0 | 0 |
| ruído branco −30 dBFS | 8 | 0 | 0 | 0 |
| ruído marrom −35 dBFS | 8 | 2 | 0 | 0 |
| varredura 100→900 Hz | 8 | 8 | 8 | 8 |
| zumbido de rede 50 Hz | 2 | 2 | 0 | 0 |
| zumbido de rede 60 Hz | 2 | 0 | 0 | 0 |
| quinta E2+B2 | 2 | 0 | 0 | 0 |
| quinta A2+E3 | 2 | 0 | 0 | 0 |
| trítono E3+Bb3 | 2 | 0 | 0 | 0 |
| semitom E4+F4 | 2 | 2 | 2 | 2 |
| acorde Em aberto | 2 | 0 | 0 | 0 |
| acorde G aberto | 2 | 0 | 0 | 0 |

## 3. Sensibilidade à duração da janela (48 kHz)
Buffer total = janela; o cálculo usa W = N − τmax − 1 amostras de integração (τmax = fs/70). Células: ±5 c · mediana/P95 (c). `—` = nada aceito.

### Limpas + desafinadas + cromáticas

| Janela | N (amostras) | W | ACF global (baseline) | YIN | MPM (ACF refinada) |
|---|---:|---:|---:|---:|---:|
| 32 ms | 1536 | 849 | 74.3% · 1.4/3.5 (oit 40) | 100.0% · 1.3/1.5 (oit 0) | 100.0% · 1.3/1.5 (oit 0) |
| 48 ms | 2304 | 1617 | 74.3% · 1.4/3.5 (oit 40) | 100.0% · 1.3/1.5 (oit 0) | 100.0% · 1.3/1.5 (oit 0) |
| 64 ms | 3072 | 2385 | 74.3% · 1.4/3.5 (oit 40) | 100.0% · 1.3/1.5 (oit 0) | 100.0% · 1.3/1.5 (oit 0) |
| 85 ms | 4080 | 3393 | 74.3% · 1.4/3.5 (oit 40) | 100.0% · 1.3/1.5 (oit 0) | 100.0% · 1.3/1.5 (oit 0) |
| 128 ms | 6144 | 5457 | 74.3% · 1.4/3.5 (oit 40) | 100.0% · 1.3/1.5 (oit 0) | 100.0% · 1.3/1.5 (oit 0) |

### Fundamental fraca (harm. fortes)

| Janela | N (amostras) | W | ACF global (baseline) | YIN | MPM (ACF refinada) |
|---|---:|---:|---:|---:|---:|
| 32 ms | 1536 | 849 | 66.7% · 1.1/1.4 (oit 12) | 100.0% · 0.7/0.7 (oit 0) | 100.0% · 0.7/0.7 (oit 0) |
| 48 ms | 2304 | 1617 | 66.7% · 1.1/1.4 (oit 12) | 100.0% · 0.7/0.7 (oit 0) | 100.0% · 0.7/0.7 (oit 0) |
| 64 ms | 3072 | 2385 | 66.7% · 1.1/1.4 (oit 12) | 100.0% · 0.7/0.7 (oit 0) | 100.0% · 0.7/0.7 (oit 0) |
| 85 ms | 4080 | 3393 | 66.7% · 1.1/1.4 (oit 12) | 100.0% · 0.7/0.7 (oit 0) | 100.0% · 0.7/0.7 (oit 0) |
| 128 ms | 6144 | 5457 | 66.7% · 1.1/1.4 (oit 12) | 100.0% · 0.7/0.7 (oit 0) | 100.0% · 0.7/0.7 (oit 0) |

### Ruído leve (SNR 30/20 dB)

| Janela | N (amostras) | W | ACF global (baseline) | YIN | MPM (ACF refinada) |
|---|---:|---:|---:|---:|---:|
| 32 ms | 1536 | 849 | 75.0% · 1.4/3.4 (oit 18) | 100.0% · 1.4/2.5 (oit 0) | 100.0% · 1.3/2.5 (oit 0) |
| 48 ms | 2304 | 1617 | 77.8% · 1.4/3.4 (oit 16) | 100.0% · 1.3/2.3 (oit 0) | 100.0% · 1.3/2.2 (oit 0) |
| 64 ms | 3072 | 2385 | 80.6% · 1.4/3.4 (oit 14) | 100.0% · 1.3/1.9 (oit 0) | 100.0% · 1.3/1.8 (oit 0) |
| 85 ms | 4080 | 3393 | 80.6% · 1.4/3.4 (oit 14) | 100.0% · 1.3/1.8 (oit 0) | 100.0% · 1.3/1.7 (oit 0) |
| 128 ms | 6144 | 5457 | 79.2% · 1.4/3.4 (oit 15) | 100.0% · 1.3/1.7 (oit 0) | 100.0% · 1.3/1.6 (oit 0) |

### Ruído moderado (SNR 10/5 dB)

| Janela | N (amostras) | W | ACF global (baseline) | YIN | MPM (ACF refinada) |
|---|---:|---:|---:|---:|---:|
| 32 ms | 1536 | 849 | 20.8% · 2.5/8.0 (oit 11) | 31.9% · 3.6/25.8 (oit 0) | 41.7% · 2.8/7.0 (oit 0) |
| 48 ms | 2304 | 1617 | 22.2% · 2.5/6.5 (oit 13) | 33.3% · 3.4/16.5 (oit 0) | 45.8% · 1.9/5.6 (oit 0) |
| 64 ms | 3072 | 2385 | 26.4% · 2.9/6.3 (oit 14) | 40.3% · 2.9/13.0 (oit 0) | 50.0% · 1.8/4.3 (oit 0) |
| 85 ms | 4080 | 3393 | 23.6% · 1.6/6.4 (oit 13) | 37.5% · 2.7/12.7 (oit 0) | 48.6% · 1.8/4.3 (oit 0) |
| 128 ms | 6144 | 5457 | 29.2% · 1.6/4.8 (oit 13) | 44.4% · 2.1/9.2 (oit 0) | 50.0% · 1.5/3.6 (oit 0) |

### Vibrato (vs. média instantânea da janela)

| Janela | N (amostras) | W | ACF global (baseline) | YIN | MPM (ACF refinada) |
|---|---:|---:|---:|---:|---:|
| 32 ms | 1536 | 849 | 65.3% · 2.2/10.4 (oit 10) | 77.8% · 2.1/8.5 (oit 0) | 77.8% · 2.1/8.5 (oit 0) |
| 48 ms | 2304 | 1617 | 73.6% · 2.6/8.3 (oit 2) | 79.2% · 2.0/9.2 (oit 0) | 79.2% · 2.0/9.1 (oit 0) |
| 64 ms | 3072 | 2385 | 77.8% · 2.5/9.5 (oit 0) | 77.8% · 2.1/9.7 (oit 0) | 77.8% · 2.1/9.6 (oit 0) |
| 85 ms | 4080 | 3393 | 77.8% · 2.8/9.6 (oit 0) | 80.6% · 2.0/10.7 (oit 0) | 80.6% · 2.0/10.5 (oit 0) |
| 128 ms | 6144 | 5457 | 79.2% · 2.8/9.4 (oit 0) | 84.7% · 1.8/8.6 (oit 0) | 86.1% · 1.9/8.4 (oit 0) |

### Oitava: ímpares fracos

| Janela | N (amostras) | W | ACF global (baseline) | YIN | MPM (ACF refinada) |
|---|---:|---:|---:|---:|---:|
| 32 ms | 1536 | 849 | 83.3% · 1.4/3.4 (oit 8) | 0.0% · —/— (oit 48) | 25.0% · 1.0/1.0 (oit 36) |
| 48 ms | 2304 | 1617 | 83.3% · 1.4/3.4 (oit 8) | 0.0% · —/— (oit 48) | 25.0% · 1.0/1.0 (oit 36) |
| 64 ms | 3072 | 2385 | 83.3% · 1.4/3.4 (oit 8) | 0.0% · —/— (oit 48) | 25.0% · 1.0/1.0 (oit 36) |
| 85 ms | 4080 | 3393 | 83.3% · 1.4/3.4 (oit 8) | 0.0% · —/— (oit 48) | 25.0% · 1.0/1.0 (oit 36) |
| 128 ms | 6144 | 5457 | 83.3% · 1.4/3.4 (oit 8) | 0.0% · —/— (oit 48) | 25.0% · 1.0/1.0 (oit 36) |

## 4. Sensibilidade ao limiar de confiança (48 kHz, 85 ms)
**Recall** = leituras com nota correta (±50 c) nas categorias 01–03, 05 leve, 05 moderado e 07 · **FP ruído** = aceitas em silêncio/ruído branco/ruído marrom/ruído ambiente · **FP polifônico** = aceitas em dueto/acordes · **Oitava** = erros de oitava na categoria 08 (ímpares fracos).

| Limiar | YIN recall | FP ruído | FP polif. | oitava | MPM (ACF refinada) recall | FP ruído | FP polif. | oitava |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 0.7 | 97.2% | 0 | 2/12 | 48 | 100.0% | 0 | 2/12 | 36 |
| 0.8 | 92.7% | 0 | 2/12 | 48 | 92.7% | 0 | 2/12 | 36 |
| 0.85 | 92.7% | 0 | 2/12 | 48 | 92.7% | 0 | 2/12 | 36 |
| 0.9 | 92.7% | 0 | 0/12 | 36 | 92.7% | 0 | 0/12 | 36 |
| 0.95 | 85.1% | 0 | 0/12 | 36 | 85.1% | 0 | 0/12 | 36 |

## 5. Ablação do tratamento de oitava (48 kHz, 85 ms)
Variação do limiar de seleção do YIN, do fator k do MPM (k = 1,0 equivale a escolher o maior pico-chave) e da guarda opcional de oitava 2τ (adota 2τ se o erro ali for < 50 % do erro em τ e este > 0,02; ver `octaveGuard`). Colunas: recall (±50 c) em 01–05, erros de oitava em 08 (ímpares fracos) e 08 (dobra de período), FP em ruído.

| Configuração | Recall | Oitava (ímpares fracos) | Oitava (dobra de período) | FP ruído |
|---|---:|---:|---:|---:|
| YIN limiar 0,10 | 100.0% | 36 | 2 | 0 |
| YIN limiar 0,15 | 100.0% | 48 | 2 | 0 |
| YIN limiar 0,20 (padrão) | 100.0% | 48 | 0 | 0 |
| YIN limiar 0,30 | 100.0% | 48 | 0 | 0 |
| MPM k 0,80 | 100.0% | 48 | 0 | 0 |
| MPM k 0,90 (padrão) | 100.0% | 36 | 2 | 0 |
| MPM k 0,95 | 100.0% | 36 | 8 | 0 |
| MPM k 1,00 (pico máximo) | 74.5% | 8 | 24 | 0 |
| YIN + guarda de oitava 2τ | 100.0% | 24 | 16 | 0 |
| MPM + guarda de oitava 2τ | 100.0% | 24 | 16 | 0 |

## 6. Baixa amplitude sobre ruído ambiente de −54 dBFS (48 kHz, 85 ms)
RMS do tom em dBFS (referência GC-013: guitarra a 50 cm/1 m ≈ −23…−9 dBFS). Com gate = decisão de produção proposta; sem gate = capacidade intrínseca do algoritmo (apenas confiança).

| Nível | YIN com gate (nota ok/n) | sem gate (nota ok/n) | MPM (ACF refinada) com gate (nota ok/n) | sem gate (nota ok/n) |
|---|---:|---:|---:|---:|
| -25 dBFS | 24/24 (gate: 0) | 24/24 (oit/harm/outro: 0/0/0) | 24/24 (gate: 0) | 24/24 (oit/harm/outro: 0/0/0) |
| -35 dBFS | 24/24 (gate: 0) | 24/24 (oit/harm/outro: 0/0/0) | 24/24 (gate: 0) | 24/24 (oit/harm/outro: 0/0/0) |
| -45 dBFS | 24/24 (gate: 0) | 24/24 (oit/harm/outro: 0/0/0) | 24/24 (gate: 0) | 24/24 (oit/harm/outro: 0/0/0) |
| -50 dBFS | 0/24 (gate: 0) | 0/24 (oit/harm/outro: 0/0/0) | 0/24 (gate: 0) | 0/24 (oit/harm/outro: 0/0/0) |
| -55 dBFS | 0/24 (gate: 24) | 0/24 (oit/harm/outro: 0/0/0) | 0/24 (gate: 24) | 0/24 (oit/harm/outro: 0/0/0) |

## 7. Vibrato (48 kHz)
Frequência instantânea conhecida. **Média da janela** = média (em cents) de f(t) nas N amostras analisadas; **centro nominal** = frequência central do vibrato (o que o afinador deveria mostrar). Células: mediana/P95 do |erro| (c) entre leituras aceitas · % aceitas.

### Profundidade ±10 c (rates 4,5 e 6,5 Hz)

| Janela | YIN: vs média da janela | vs centro nominal | aceitas | MPM (ACF refinada): vs média da janela | vs centro nominal | aceitas |
|---|---:|---:|---:|---:|---:|---:|
| 32 ms | 1.2/2.7 | 8.5/10.8 | 100.0% | 1.2/2.7 | 8.5/10.8 | 100.0% |
| 48 ms | 1.1/2.6 | 7.5/10.5 | 100.0% | 1.1/2.6 | 7.5/10.4 | 100.0% |
| 64 ms | 1.1/2.5 | 5.9/10.1 | 100.0% | 1.1/2.5 | 5.9/10.1 | 100.0% |
| 85 ms | 1.3/2.7 | 4.3/9.1 | 100.0% | 1.3/2.6 | 4.3/9.1 | 100.0% |
| 128 ms | 1.4/2.5 | 2.6/7.2 | 100.0% | 1.3/2.4 | 2.6/7.1 | 100.0% |

### Profundidade ±25 c (rates 4,5 e 6,5 Hz)

| Janela | YIN: vs média da janela | vs centro nominal | aceitas | MPM (ACF refinada): vs média da janela | vs centro nominal | aceitas |
|---|---:|---:|---:|---:|---:|---:|
| 32 ms | 1.6/6.3 | 16.2/25.3 | 100.0% | 1.6/6.3 | 16.2/25.3 | 100.0% |
| 48 ms | 1.5/6.1 | 17.9/22.9 | 100.0% | 1.5/6.0 | 17.9/22.9 | 100.0% |
| 64 ms | 1.4/5.5 | 16.1/21.9 | 100.0% | 1.4/5.4 | 16.1/21.9 | 100.0% |
| 85 ms | 1.0/4.8 | 14.7/19.7 | 100.0% | 1.1/4.7 | 14.7/19.7 | 100.0% |
| 128 ms | 1.2/3.5 | 6.4/15.7 | 100.0% | 1.3/3.5 | 6.4/15.7 | 100.0% |

### Profundidade ±50 c (rates 4,5 e 6,5 Hz)

| Janela | YIN: vs média da janela | vs centro nominal | aceitas | MPM (ACF refinada): vs média da janela | vs centro nominal | aceitas |
|---|---:|---:|---:|---:|---:|---:|
| 32 ms | 5.5/9.2 | 20.6/49.4 | 100.0% | 5.5/9.2 | 20.7/49.4 | 100.0% |
| 48 ms | 5.4/10.3 | 24.3/47.9 | 100.0% | 5.4/10.2 | 24.3/47.9 | 100.0% |
| 64 ms | 6.2/11.2 | 30.2/45.5 | 100.0% | 6.1/11.0 | 30.2/45.5 | 100.0% |
| 85 ms | 5.6/12.0 | 27.9/40.4 | 100.0% | 5.6/11.7 | 27.7/40.3 | 100.0% |
| 128 ms | 4.6/8.9 | 18.1/29.6 | 100.0% | 4.3/8.6 | 17.9/29.7 | 100.0% |

## 8. Faixa operacional por nota (categoria 03, 85 ms)
Notas MIDI 38 (D2, 73,4 Hz) … 83 (B5, 987,8 Hz). Células: leituras aceitas com ±5 c / n (2 instantes × 2 sementes = 4 por nota).

| Nota | Hz | YIN 48 kHz | MPM 48 kHz | YIN 16 kHz | MPM 16 kHz |
|---|---:|---:|---:|---:|---:|
| MIDI 38 | 73.4 | 4/4 (med 1.2) | 4/4 (med 1.2) | 4/4 (med 1.2) | 4/4 (med 1.2) |
| MIDI 42 | 92.5 | 4/4 (med 1.5) | 4/4 (med 1.5) | 4/4 (med 1.5) | 4/4 (med 1.5) |
| MIDI 47 | 123.5 | 4/4 (med 1.4) | 4/4 (med 1.4) | 4/4 (med 1.4) | 4/4 (med 1.4) |
| MIDI 52 | 164.8 | 4/4 (med 1.3) | 4/4 (med 1.2) | 4/4 (med 1.3) | 4/4 (med 1.2) |
| MIDI 57 | 220.0 | 4/4 (med 1.3) | 4/4 (med 1.3) | 4/4 (med 1.3) | 4/4 (med 1.2) |
| MIDI 62 | 293.7 | 4/4 (med 1.3) | 4/4 (med 1.3) | 4/4 (med 1.5) | 4/4 (med 1.4) |
| MIDI 67 | 392.0 | 4/4 (med 1.2) | 4/4 (med 1.2) | 4/4 (med 1.2) | 4/4 (med 0.7) |
| MIDI 72 | 523.3 | 4/4 (med 1.4) | 4/4 (med 1.3) | 4/4 (med 1.1) | 4/4 (med 0.7) |
| MIDI 79 | 784.0 | 4/4 (med 1.5) | 4/4 (med 1.3) | 0/4 (med 5.7) | 4/4 (med 4.3) |
| MIDI 83 | 987.8 | 4/4 (med 1.2) | 4/4 (med 1.1) | 0/4 (med 21.3) | 0/4 (med —) |

## 9. Sensibilidade à taxa de amostragem (48 kHz × 16 kHz)
A GC-013 prefere 48 kHz e usa 16 kHz como fallback. Mesmas durações em ms; N e τmax escalam com fs. Células: ±5 c · mediana/P95.

| Grupo | Janela | YIN 48k | YIN 16k | MPM 48k | MPM 16k |
|---|---:|---:|---:|---:|---:|
| Limpas+desafinadas+cromáticas | 64 ms | 100.0% · 1.3/1.5 | 97.1% · 1.4/1.7 | 100.0% · 1.3/1.5 | 98.6% · 1.3/1.5 |
| Limpas+desafinadas+cromáticas | 85 ms | 100.0% · 1.3/1.5 | 97.1% · 1.4/1.7 | 100.0% · 1.3/1.5 | 98.6% · 1.3/1.5 |
| Limpas+desafinadas+cromáticas | 128 ms | 100.0% · 1.3/1.5 | 97.1% · 1.4/1.7 | 100.0% · 1.3/1.5 | 98.6% · 1.3/1.5 |
| Fundamental fraca | 64 ms | 100.0% · 0.7/0.7 | 100.0% · 0.7/0.8 | 100.0% · 0.7/0.7 | 100.0% · 0.6/0.7 |
| Fundamental fraca | 85 ms | 100.0% · 0.7/0.7 | 100.0% · 0.7/0.8 | 100.0% · 0.7/0.7 | 100.0% · 0.6/0.7 |
| Fundamental fraca | 128 ms | 100.0% · 0.7/0.7 | 100.0% · 0.7/0.8 | 100.0% · 0.7/0.7 | 100.0% · 0.6/0.7 |
| Ruído leve | 64 ms | 100.0% · 1.3/1.9 | 100.0% · 1.3/1.7 | 100.0% · 1.3/1.8 | 100.0% · 1.2/1.6 |
| Ruído leve | 85 ms | 100.0% · 1.3/1.8 | 100.0% · 1.3/1.7 | 100.0% · 1.3/1.7 | 100.0% · 1.2/1.6 |
| Ruído leve | 128 ms | 100.0% · 1.3/1.7 | 100.0% · 1.3/1.6 | 100.0% · 1.3/1.6 | 100.0% · 1.2/1.5 |
| Vibrato (média da janela) | 64 ms | 77.8% · 2.1/9.7 | 77.8% · 2.2/9.9 | 77.8% · 2.1/9.6 | 77.8% · 2.1/9.5 |
| Vibrato (média da janela) | 85 ms | 80.6% · 2.0/10.7 | 79.2% · 2.0/10.8 | 80.6% · 2.0/10.5 | 80.6% · 2.1/10.6 |
| Vibrato (média da janela) | 128 ms | 84.7% · 1.8/8.6 | 84.7% · 1.8/8.7 | 86.1% · 1.9/8.4 | 86.1% · 1.9/8.4 |
| Oitava: ímpares fracos (oit) | 64 ms | 0.0% · —/— (48) | 0.0% · —/— (48) | 25.0% · 1.0/1.0 (36) | 25.0% · 1.0/1.0 (36) |
| Oitava: ímpares fracos (oit) | 85 ms | 0.0% · —/— (48) | 0.0% · —/— (48) | 25.0% · 1.0/1.0 (36) | 25.0% · 1.0/1.0 (36) |
| Oitava: ímpares fracos (oit) | 128 ms | 0.0% · —/— (48) | 0.0% · —/— (48) | 25.0% · 1.0/1.0 (36) | 25.0% · 1.0/1.0 (36) |

## 10. Sequências: troca de nota, ataque e decaimento (48 kHz, hop de 20 ms)
Estabilizador: K quadros consecutivos aceitos, dispersão ≤ 50 c, saída = mediana. **Tempo de estabilização** = do instante do evento (troca de nota/ataque) até o início do trecho em que *todas* as saídas seguintes ficam dentro da tolerância (até 0,8 s após a troca ou 1,0 s após o ataque); `falha` = nunca estabilizou. **Nota antiga** = tempo em que a saída ainda exibiu a nota anterior (>50 c). Modo “10 Hz” = última saída retida a cada 100 ms, fases 0/25/50/75 ms agregadas. Referência de tempo: o instante t da saída é o fim da janela (o atraso acústico–software do Android não está incluído).

### Troca abrupta de nota (24 sequências)

| Algoritmo | Janela | K | interno ±5c (med/P95 ms) | interno ±50c | 10 Hz ±5c | 10 Hz ±50c | nota antiga (med ms) |
|---|---:|---:|---:|---:|---:|---:|---:|
| YIN | 48 ms | 2 | 68/68 | 68/68 | 112/150 | 100/150 | 20 |
| YIN | 48 ms | 3 | 88/88 | 88/88 | 137/175 | 137/175 | 20 |
| YIN | 48 ms | 5 | 128/128 | 128/128 | 187/225 | 187/225 | 20 |
| YIN | 64 ms | 2 | 84/84 | 84/84 | 125/175 | 125/175 | 20 |
| YIN | 64 ms | 3 | 104/104 | 104/104 | 150/200 | 150/200 | 20 |
| YIN | 64 ms | 5 | 144/144 | 144/144 | 175/225 | 175/225 | 20 |
| YIN | 85 ms | 2 | 105/105 | 105/105 | 150/200 | 150/200 | 20 |
| YIN | 85 ms | 3 | 125/125 | 125/125 | 150/200 | 150/200 | 20 |
| YIN | 85 ms | 5 | 165/165 | 165/165 | 200/250 | 200/250 | 20 |
| YIN | 128 ms | 2 | 148/148 | 148/148 | 175/225 | 175/225 | 20 |
| YIN | 128 ms | 3 | 168/168 | 168/168 | 200/250 | 200/250 | 20 |
| YIN | 128 ms | 5 | 208/208 | 208/208 | 250/300 | 250/300 | 20 |
| MPM (ACF refinada) | 48 ms | 2 | 68/68 | 68/68 | 112/150 | 100/150 | 20 |
| MPM (ACF refinada) | 48 ms | 3 | 88/88 | 88/88 | 137/175 | 137/175 | 20 |
| MPM (ACF refinada) | 48 ms | 5 | 128/128 | 128/128 | 187/225 | 187/225 | 20 |
| MPM (ACF refinada) | 64 ms | 2 | 84/84 | 84/84 | 125/175 | 125/175 | 20 |
| MPM (ACF refinada) | 64 ms | 3 | 104/104 | 104/104 | 150/200 | 150/200 | 20 |
| MPM (ACF refinada) | 64 ms | 5 | 144/144 | 144/144 | 175/225 | 175/225 | 20 |
| MPM (ACF refinada) | 85 ms | 2 | 105/105 | 105/105 | 150/200 | 150/200 | 20 |
| MPM (ACF refinada) | 85 ms | 3 | 125/125 | 125/125 | 150/200 | 150/200 | 20 |
| MPM (ACF refinada) | 85 ms | 5 | 165/165 | 165/165 | 200/250 | 200/250 | 20 |
| MPM (ACF refinada) | 128 ms | 2 | 148/148 | 148/148 | 175/225 | 175/225 | 20 |
| MPM (ACF refinada) | 128 ms | 3 | 168/168 | 168/168 | 200/250 | 200/250 | 20 |
| MPM (ACF refinada) | 128 ms | 5 | 208/208 | 208/208 | 250/300 | 250/300 | 20 |

### Palhetada: ataque, transiente, glissando +6 c e decaimento (12 sequências)

| Algoritmo | Janela | K | interno ±5c (med/P95 ms) | interno ±50c | 10 Hz ±5c | 10 Hz ±50c | nota antiga (med ms) | saídas antes do ataque |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| YIN | 48 ms | 2 | 98/108 | 68/68 | 150/200 | 100/150 | 0 | 0 |
| YIN | 48 ms | 3 | 88/108 | 88/88 | 150/200 | 125/175 | 0 | 0 |
| YIN | 48 ms | 5 | 128/128 | 128/128 | 188/225 | 175/225 | 0 | 0 |
| YIN | 64 ms | 2 | 104/104 | 64/84 | 150/200 | 125/166 | 0 | 0 |
| YIN | 64 ms | 3 | 104/104 | 84/104 | 150/200 | 150/191 | 0 | 0 |
| YIN | 64 ms | 5 | 124/144 | 124/144 | 175/216 | 175/216 | 0 | 0 |
| YIN | 85 ms | 2 | 125/125 | 65/85 | 162/200 | 125/166 | 0 | 0 |
| YIN | 85 ms | 3 | 125/125 | 85/105 | 162/200 | 150/191 | 0 | 0 |
| YIN | 85 ms | 5 | 145/145 | 125/145 | 175/225 | 175/216 | 0 | 0 |
| YIN | 128 ms | 2 | 148/148 | 68/77 | 188/225 | 100/150 | 0 | 0 |
| YIN | 128 ms | 3 | 148/148 | 88/97 | 188/225 | 125/175 | 0 | 0 |
| YIN | 128 ms | 5 | 168/168 | 128/137 | 200/250 | 175/225 | 0 | 0 |
| MPM (ACF refinada) | 48 ms | 2 | 98/108 | 68/68 | 150/200 | 100/150 | 0 | 0 |
| MPM (ACF refinada) | 48 ms | 3 | 88/108 | 88/88 | 150/200 | 125/175 | 0 | 0 |
| MPM (ACF refinada) | 48 ms | 5 | 128/128 | 128/128 | 188/225 | 175/225 | 0 | 0 |
| MPM (ACF refinada) | 64 ms | 2 | 104/104 | 64/73 | 150/200 | 100/150 | 0 | 0 |
| MPM (ACF refinada) | 64 ms | 3 | 104/104 | 84/93 | 150/200 | 125/175 | 0 | 0 |
| MPM (ACF refinada) | 64 ms | 5 | 124/133 | 124/133 | 175/200 | 175/200 | 0 | 0 |
| MPM (ACF refinada) | 85 ms | 2 | 125/125 | 65/74 | 162/200 | 100/150 | 0 | 0 |
| MPM (ACF refinada) | 85 ms | 3 | 125/125 | 85/94 | 162/200 | 125/175 | 0 | 0 |
| MPM (ACF refinada) | 85 ms | 5 | 145/145 | 125/134 | 175/225 | 175/200 | 0 | 0 |
| MPM (ACF refinada) | 128 ms | 2 | 128/148 | 68/77 | 175/225 | 100/150 | 0 | 0 |
| MPM (ACF refinada) | 128 ms | 3 | 128/148 | 88/97 | 175/225 | 125/175 | 0 | 0 |
| MPM (ACF refinada) | 128 ms | 5 | 148/168 | 128/137 | 200/241 | 175/225 | 0 | 0 |

