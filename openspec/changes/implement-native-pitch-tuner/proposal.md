# Proposal — GC-014: detecção de pitch e afinador

## Why
A [GC-014 / #24](https://github.com/dvmarques/riffando/issues/24), vinculada ao [EP-04 / #4](https://github.com/dvmarques/riffando/issues/4), deve transformar a captura PCM nativa concluída na GC-013 (#23, PR #60) na primeira capacidade musical utilizável. O diagnóstico atual mede amplitude, mas não reconhece altura musical.

## What Changes
**Decisões de produto aprovadas em 29/10/2026 (Propose, não Apply):**
- Afinador **cromático**, com modo **guitarra** de seis cordas em afinação padrão E2 A2 D3 G3 B3 E4.
- Detecção de pitch **nativa Android**, aproveitando o módulo Kotlin/AudioRecord existente; PCM permanece nativo.
- Interface com **nota grande, ponteiro visual e desvio em cents**.
- Primeira entrega **básica e confiável**, offline, usando microfone integrado e com validação física.

**Proposta funcional:** detecção monofônica de frequência fundamental, conversão Hz → nota/oitava/cents (A4=440 Hz fixo nesta etapa, sujeito a confirmação), estimativa de confiança e supressão de resultados não confiáveis; modo guitarra evidencia corda-alvo sem impedir operação cromática. UI acessível em pt-BR com estados sem sinal, instável, captura negada/interrompida e erro. Analisar limitações de harmônicos, amplificador, ruído e oitavas.

## Fora do escopo
USB/seleção de dispositivos (#25), redução avançada de ruído (#26), afinações Drop D/personalizadas e referência A4 configurável (PRD RF-01, fases futuras), acordes/polifonia, treinador/onsets, metrônomo, C++/iOS, armazenamento/gravação, telemetria, backend, login e publicação.

## Critérios de aceite
- CA-01: inicia/paralisa detecção sob ação explícita, usando PCM nativo existente e permissão contextual; ciclo de vida e recursos liberados corretamente.
- CA-02: produz frequência, nota, oitava, cents e confiança/qualidade de sinais **monofônicos**; não inventa resultados quando insuficiente ou ambíguo.
- CA-03: modo cromático e modo guitarra padrão com referências corretas; cromático não fica limitado às seis notas de cordas soltas.
- CA-04: tela em pt-BR com nota grande, ponteiro e cents, sinalização inequívoca de grave/afinado/agudo, estabilidade visual e acessibilidade (TalkBack/fonte ampliada).
- CA-05: arquitetura mantém DSP e PCM no Android, ponte de eventos limitada e domínio de conversão musical testável; sem dependências desnecessárias; iOS futuro não bloqueado.
- CA-06: testes determinísticos com tons sintetizados, silêncios, ruído, harmônicos, mudanças de nota, desafinação ± cents e limites; algoritmos/limiares explicitados com evidência.
- CA-07: validação real no Galaxy S25 FE (Android 16), microfone embutido, guitarra com amplificador, diferentes cordas/volumes e distâncias, repetição, 10 min contínuos, background/permissão; registrar SHA, método, falhas, incertezas e resultados, não extrapolar precisão universal.
- CA-08: sem upload, persistência de PCM ou telemetria; funciona offline; `npm run validate`, `npm run check:expo`, testes nativos, APK e CI conforme impacto, documentação/licenças e revisão.

## Capabilities
### New Capabilities
- `native-pitch-tuner`: análise de pitch monofônico e afinador visual no Android.
### Modified Capabilities
- `native-pcm-capture`: integração do analisador sem alterar as garantias de privacidade, permissões ou ciclo de vida da captura; especificar alteração de contrato se necessária.

## Impact
Módulo Expo Android existente, adaptador TypeScript, domínio musical puro, tela/rota de afinador, testes Kotlin/JS, docs/DECISIONS.md, docs/development/, CHANGELOG.md e possível atualização da navegação. Sem migração de dados.

## Aprovação
Aprovado apenas o **refinamento e a criação de artefatos OpenSpec**. **Apply, alteração de arquitetura relevante, archive, PR de implementação e merge dependem de autorizações separadas.** Hipóteses pendentes: algoritmo e limiares de confiança/latência/precisão, referência A4 fixa e calibração. A meta ±5 cents em sinal limpo é exploratória, não resultado comprovado.
