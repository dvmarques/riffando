# GC-014 — Tempo de execução em Node (não determinístico)
Medidas em Node 22 (JIT V8) neste executor, **sem relação com Kotlin/ART, CPU do Galaxy S25 FE, bateria ou latência de áudio**. Servem apenas para comparar o custo relativo dos três algoritmos e o crescimento com a janela. Mediana de 15 execuções após aquecimento.

| fs (Hz) | Janela | N | W | W·τmax (M MAC) | ACF global (baseline) (ms) | YIN (ms) | MPM (ACF refinada) (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|
| 48000 | 48 ms | 2304 | 1617 | 1.11 | 2.46 | 1.78 | 1.52 |
| 48000 | 85 ms | 4080 | 3393 | 2.33 | 4.91 | 3.28 | 3.09 |
| 48000 | 128 ms | 6144 | 5457 | 3.74 | 7.73 | 5.24 | 4.90 |
| 16000 | 48 ms | 768 | 538 | 0.12 | 0.24 | 0.17 | 0.16 |
| 16000 | 85 ms | 1360 | 1130 | 0.26 | 0.52 | 0.36 | 0.34 |
| 16000 | 128 ms | 2048 | 1818 | 0.42 | 0.83 | 0.59 | 0.56 |

Escala: o custo é ≈ W·τmax multiplicações-acumulações por quadro, para YIN e MPM (ACF baseline ≈ 3×). A 50 quadros/s (hop 20 ms) e 48 kHz, janela 85 ms: ≈ 50 × W·τmax MAC/s — ver coluna W·τmax. Otimizações (decimação, FFT) **não foram avaliadas**.
