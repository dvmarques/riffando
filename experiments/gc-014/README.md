# GC-014 — POC isolada: YIN vs autocorrelação

## Estado
Experimento independente em Node 22; **não é Apply**, não altera módulo Expo/Kotlin, não integra afinador e não constitui validação em Android. Executado localmente em 29/10/2026. Código reproduzível: [compare-pitch.mjs](compare-pitch.mjs).

## OpenSpec — revisão antes da POC
- Inspecionados `proposal.md`, `design.md`, `tasks.md` e `specs/native-pitch-tuner/spec.md` da change `implement-native-pitch-tuner` na branch de Propose.
- Os quatro artefatos existem, os cenários da spec contêm Requirements/WHEN/THEN, as tarefas não estão marcadas como concluídas e o escopo não autoriza Apply.
- **Validação formal pendente:** não foi possível executar `npm exec -- openspec validate implement-native-pitch-tuner --strict` ou `npm exec -- openspec list --json` no checkout remoto nesta execução. Portanto não declarar a change validada pelo CLI.

## Configuração e método
Sinais gerados determinísticamente, PCM simulado em Float64, amostragem 8 kHz; janela 2.048 amostras = 256 ms; faixa pesquisada de 70–1.000 Hz. Sem amostras acústicas, sem dispositivo físico. YIN de diferença quadrática com limiar CMNDF 0,12 e interpolação parabólica; autocorrelação normalizada simples com pico global e limiar 0,65, sem interpolação. Tempos de execução foram medidos localmente e **não são latência Android, latência ponta a ponta nem benchmark justo de implementação otimizada**.

## Resultados observados (erros em cents)
| Caso | ACF | YIN |
|---|---:|---:|
| E2 limpa | +1,4 | +0,1 |
| A2 limpa | −6,5 | +0,1 |
| D3 limpa | −1200,5 | +0,1 |
| G3 limpa | −7,8 | +0,4 |
| B3 limpa | −1898,6 | +0,5 |
| E4 limpa | −2398,6 | +1,2 |
| A4 limpa | −2788,0 | +2,5 |
| A2 com harmônico | −6,5 | +0,1 |
| E2 +15 cents | +4,4 | +0,1 |
| B3 com ruído baixo | −1205,5 | +0,7 |
| Silêncio | sem nota | sem nota |

**Contagem correta:** YIN 10/10 tons dentro de ±5 cents; ACF 2/10 (E2 e E2 +15c). Ambos rejeitaram o silêncio. Valores podem variar entre implementações nas condições numéricas, mas a entrada é determinística.

## Interpretação e limitações
YIN é o candidato mais forte desta configuração; a estratégia ACF de pico global tem falhas de oitava graves. A comparação não demonstra superioridade universal de YIN sobre autocorrelação refinada e não valida ruído forte, ataques, transientes, distorção, vibrato, mudança rápida, microfone real, CPU/bateria/latência Android ou precisão universal ±5 cents. A janela de 256 ms já representa um tradeoff importante frente à meta exploratória de resposta ≤300 ms.

## Antes do Apply
1. Executar validador OpenSpec oficial e corrigir erros, se existirem.
2. Refinar algoritmo/limiares com corpus mais amplo e mesma janela/custo computacional, incluindo ACF com seleção adequada de picos e interpolação.
3. Definir protocolo para Android real: seis cordas, afinador de referência, distância/volume, erro mediano/P95, estabilidade, falsos positivos, tempo de estabilização, uso de CPU, condições de rejeição e documentação de aparelho/build.
4. Manter autorização de implementação e merge separadas. Nenhum desempenho físico é reivindicado.

## Comando
```bash
node experiments/gc-014/compare-pitch.mjs
```
