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
## Protocolo de saída para Apply (revisão 29/10)
- Validação oficial OpenSpec continua **não executada**: o checkout não pôde ser obtido neste executor por falha de resolução DNS. A inspeção documental não a substitui.
- Benchmarks atuais são somente de sinais sintéticos em Python; YIN 12/15 e ACF de pico global 3/15. Comparar ACF refinada, janelas temporais equivalentes e sequências com mudança de notas. Não inferir latência Android a partir de tempos Python.
- Métricas antes de fechar critérios: erro mediano/P95 dos tons limpos, rejeições e falsos positivos sob ruído, troca de oitavas, latência entre mudança e nota estável, CPU e taxa de eventos; vibrato precisa de referência de frequência instantânea.
- Metas exploratórias: ±5 cents sob sinal limpo; atualização visual da ordem de 10 Hz; estabilização em até 300 ms **apenas se medido e viável**. Janela de 256 ms consome quase todo o orçamento de 300 ms; testar janelas menores e pipeline sobreposto.
- Teste físico obrigatório no Galaxy S25 FE Android 16, seis cordas, afinações ligeiramente desviadas, diferentes intensidades/distâncias, permissão/background e execução contínua. Nenhum teste físico desta POC foi executado.
- O afinador e o módulo Kotlin não foram alterados. A eventual aprovação de Apply continua separada.
