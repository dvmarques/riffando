# Revisão ampliada da POC GC-014 — 29/10/2026

Executados localmente em Python 15 sinais sintéticos determinísticos (8 kHz, 2048 amostras, janela 256 ms), comparando YIN simplificado e autocorrelação normalizada com pico global. Resultado dentro de ±5 cents: YIN 12/15, ACF 3/15. Ambos rejeitaram silêncio. Os três casos YIN fora do alvo foram A2 com ruído moderado (+7,14 cents), E2 muito fraco (+16,02 cents) e A2 com vibrato (+11,54 cents em relação à frequência central; métrica inadequada para vibrato). Os resultados não são um benchmark em Kotlin nem Android; tempos de Python não representam desempenho nativo.

## Próximas providências
- Conservar YIN como candidato, sem decisão irreversível antes de validação nativa.
- Acrescentar política de confiança, nível mínimo de sinal e histerese; rejeitar leitura quando não confiável.
- Testar mudança temporal de nota e vibrato contra uma trajetória instantânea conhecida, não frequência média fixa.
- Comparar com autocorrelação com seleção de picos e interpolação, não só ACF simples.
- Validar formalmente OpenSpec com CLI no checkout completo: `npm exec -- openspec validate implement-native-pitch-tuner --strict` e `npm exec -- openspec list --json` (não executados).
- Validar em Android físico antes de assumir ±5 cents ou até 300 ms.

Sem integração do afinador, Apply ou merge.