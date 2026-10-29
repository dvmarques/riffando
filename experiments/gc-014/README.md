# GC-014 — Benchmark sintético de detecção de pitch

## Estado e escopo

Experimento **isolado** em Node 22+, sem dependências, sem gravações e sem integração com o app. **Não é Apply**, não altera o módulo Expo/Kotlin e **não constitui validação em Android**. Substitui o POC inicial (YIN × ACF simples, 11 sinais), cujo código está no histórico do Git da PR #61. Resultados: [results/report.md](results/report.md) (determinístico) e [results/timing.md](results/timing.md) (tempos de Node, não determinísticos).

```bash
node experiments/gc-014/run-benchmark.mjs   # ≈ 4 min em Node 22; reescreve results/
node --test tests/tooling/gc-014-pitch-poc.test.mjs   # testes de contrato do POC (rápidos)
```

## Método

- **Sinais:** PRNG `mulberry32` com sementes fixas; parciais com inarmonicidade B = 5·10⁻⁵ (estresse: 3·10⁻⁴), PCM16 simulado, ruído ambiente de −54 dBFS nos cenários de baixa amplitude (medido na GC-013). 423 casos em 11 categorias × 2 instantes de janela: cordas soltas, desafinações ±5…±40 c, faixa cromática D2–B5, fundamental fraca, ruído leve (SNR 20–30 dB) e moderado (5–10 dB), baixa amplitude, vibrato (frequência instantânea conhecida), erros de oitava, inarmonicidade alta, silêncio/ruído/sinais ambíguos.
- **Algoritmos** (mesmo buffer e faixa 70–1000 Hz): ACF de pico global (baseline), YIN (CMNDF, limiar 0,2, interpolação) e MPM (NSDF, picos-chave k = 0,9, interpolação). Variante opcional: guarda de oitava 2τ (ablação).
- **Janelas:** 32, 48, 64, 85 e 128 ms a 48 kHz; 64, 85 e 128 ms a 16 kHz (N, τmax e conversões escalam com a taxa).
- **Política:** gate de nível −50 dBFS (RMS da janela) e confiança ≥ 0,85 a priori; sensibilidade 0,70–0,95 no relatório. Sem calibração com o corpus de avaliação.
- **Métricas:** erro absoluto mediano e P95 (cents) entre leituras aceitas com a nota correta, taxa dentro de ±5 c sobre todas as amostras (rejeições contam como falha), erros de oitava/harmônico/outro, rejeições por gate e confiança, falsos positivos em sinais sem tom, tempo de estabilização em 24 trocas de nota e 12 palhetadas (estabilizador K = 2/3/5, saída interna a 50 Hz e emissão a 10 Hz em quatro fases), tempo exibindo a nota antiga.
- **Vibrato:** erro contra a média da frequência instantânea na janela e contra o centro nominal.

## Principais resultados (48 kHz, 85 ms; ver o relatório para tudo)

| Categoria | ACF global | YIN | MPM |
| --- | ---: | ---: | ---: |
| Limpas + desafinadas + cromáticas (n = 280) | 74 % | 100 % | 100 % |
| Fundamental fraca (n = 72) | 67 % | 100 % | 100 % |
| Ruído leve (n = 72) | 81 % | 100 % | 100 % |
| Ruído moderado (n = 72) | 24 % | 38 % | 49 % |
| Vibrato vs. média da janela (n = 72) | 78 % | 81 % | 81 % |
| Erro mediano / P95 em limpas (cents) | 1,4 / 3,5 | 1,3 / 1,5 | 1,3 / 1,5 |

Células: amostras aceitas com erro ≤ 5 cents; rejeições contam como falha. Estabilização (K = 3, emissão a 10 Hz, tolerância ±5 c): mediana 150 ms e P95 200 ms para janelas de 64–85 ms, em trocas de nota e palhetadas. Ruído moderado: nenhuma nota errada aceita (só rejeições). Erro de oitava com harmônicos ímpares ≲ 20 % dos pares: YIN 48/48, MPM 36/48; a guarda 2τ corrige metade e cria 14 erros no caso de dobra de período. A 16 kHz notas a partir de 784 Hz excedem ±5 c.

## Limitações

- Sintético: sem microfone, guitarra, amplificador, processamento do fabricante, saturação ou ruído real; a inarmonicidade das cordas reais é desconhecida e afeta o viés (B = 3·10⁻⁴ ⇒ +7,9 c).
- O instante t de cada saída é o fim da janela; **o atraso de entrada/saída do Android e a latência ponta a ponta não estão incluídos**.
- Os tempos de Node/V8 não representam Kotlin/ART nem o Galaxy S25 FE; usar apenas o custo relativo e a contagem W·τmax.
- 44,1 kHz, hum de 100/120 Hz, voz e instrumentos não guitarra não foram avaliados. O corpus é limitado a 11 categorias e poucas sementes por caso; não permite extrapolar precisão universal.
- Nenhum resultado físico foi obtido. Protocolo: [TUNER_VALIDATION.md](../../docs/development/TUNER_VALIDATION.md).
