# Design — GC-014

## Contexto atual
A GC-013 implementou módulo Expo local em Kotlin com AudioRecord, captura PCM mono PCM16 (48 kHz preferencial), worker de leitura, controle de permissões/ciclo de vida, métricas RMS/pico e bridge de aproximadamente 5 eventos/s sem PCM em JS. Validação física registrada para Galaxy S25 FE Android 16; entrada MIC pode receber processamento do fabricante. Revisar implementação e assinaturas reais no início do Apply, evitando dois AudioRecord concorrentes.

## Decisões confirmadas
Afinador cromático e modo guitarra, Android nativo, nota grande + ponteiro + cents, escopo mínimo confiável e offline.

## Alternativas para detecção de pitch
1. **YIN/autocorrelação normalizada (preferência para POC):** implementação Kotlin inicialmente, sem dependência DSP externa, avaliações com fontes sintéticas e guitarra; atenção a harmônicos/sub-harmônicos, silêncio e custo por janela.
2. Autocorrelação convencional: simples, porém sujeita a erros de oitava e estabilidade.
3. FFT/picos: útil para inspeção, mas máximo espectral não é necessariamente fundamental; maior complexidade de janela/interpolação.
4. pYIN/C++: adiar até evidência de necessidade de qualidade/performance; revisar licenças e custo de manutenção.

**Não fechar algoritmo antes de benchmark reproduzível** com testes comparáveis em sinais e aparelho físico. Decisão de introduzir C++ ou biblioteca externa exige autorização arquitetural específica.

## Fluxo proposto
AudioRecord PCM16 + timestamps monotônicos → buffer circular nativo limitado → janela/energia e pré-filtro conservador → análise monofônica de F0/qualidade → rejeição de sinal sem confiança → suavização com limite de atraso → evento estruturado e limitado → adaptador TS → UI. Nenhum frame PCM cru passa ao JS. Não presumir medição de latência ponta a ponta somente por timestamp.

## Contrato conceitual
`PitchEvent { frequencyHz, noteName, octave, cents, confidence, observedAtMonotonicNs, quality, source }` (contrato ilustrativo; definir unidades e nulabilidade, geração/ID de sessão e sequência para descartar eventos tardios após stop/restart); representar resultados indisponíveis como estado `no-signal/unstable/unreliable` sem frequência/nome fictícios. O domínio musical converte frequência em semitons/cents com A4=440 Hz inicialmente proposto; separar cifras (E2) e nomes pt-BR (Mi2), alinhando com GC-005/#15 e GC-039/#49 sem implementar seu escopo inteiro.

## Interface
Duas opções cromático/guitarra; guitarra exibe cordas E2 A2 D3 G3 B3 E4 e permite selecionar a corda-alvo; desvio da corda-alvo e desvio cromático não podem ser confundidos; nota grande; ponteiro centrado em 0 cents, limites e saturação visual identificados; texto explícito Grave/Afinado/Agudo sem depender apenas de cor; confiança insuficiente não mantém nota antiga como atual. Controles acessíveis, fonte ampliada, TalkBack sem anúncios de 5 vezes/segundo.

## Riscos e testes
Voz/ruído, ataques, decaimento, guitarra amplificada e harmônicos podem causar falsos positivos/erros de oitava; comparar tons sintéticos 70–1000 Hz (faixa inicial de teste, não faixa operacional garantida) e notas de cordas, incluindo níveis fracos/fortes. Janelas maiores melhoram resolução porém pioram resposta; definir protocolo com sinal de referência, distância/volume, série de medições, percentis e tolerância antes de aprovar limites; medir CPU, atualização, variação em cents, eventos descartados e tempo de estabilização sem prometer limites universais. Testar concorrência, permissão negada/revogada, background e 20 ciclos iniciar/parar. Verificar em aparelho real e builds Android (Expo Go não comprova nativo). Sem armazenar gravações.

## Dependências e documentação
Reutilizar módulo atual, sem nova biblioteca antes de avaliar licenças/lock. Atualizar testes, documentação do módulo, decisões e changelog durante Apply. Build e testes completos no Verify, não inferir que foram executados no Propose.
