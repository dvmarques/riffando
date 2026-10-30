# Spec Delta

## Purpose

Disponibilizar um afinador cromático e um modo guitarra em Android, com análise de pitch monofônico nativa sobre o PCM da captura existente, que apresente apenas leituras confiáveis e nunca invente nota, afinação ou precisão não medida.

## ADDED Requirements

### Requirement: Análise nativa de pitch monofônico

O módulo Android MUST analisar o PCM da captura existente (`AudioRecord`) em código nativo, MUST NOT enviar PCM bruto ao JavaScript, MUST NOT abrir um segundo `AudioRecord` e MUST informar frequência fundamental, nota, oitava, cents e confiança usando a taxa de amostragem efetiva da captura.

#### Scenario: Nota estável e limpa

- **WHEN** uma nota monofônica estável e limpa na faixa operacional chega ao microfone com permissão concedida
- **THEN** o afinador emite frequência, nota, oitava, cents e confiança calculados sobre a janela de análise configurada, e nenhuma amostra PCM cruza a ponte nativa

#### Scenario: Taxa de amostragem efetiva diferente da preferida

- **WHEN** a captura opera em 44,1 kHz ou 16 kHz em vez de 48 kHz
- **THEN** janela, lags de busca e conversão para Hz usam a taxa efetiva, e a faixa operacional anunciada respeita o limite validado para essa taxa

### Requirement: Rejeição de leituras não confiáveis

O afinador MUST rejeitar a leitura quando o nível RMS da janela estiver abaixo do gate de nível ou a confiança estiver abaixo do limiar configurado, MUST representar a rejeição como estado explícito (`sem sinal`, `instável` ou `não confiável`) sem frequência ou nome de nota fictícios e MUST NOT manter a última nota como leitura atual.

#### Scenario: Silêncio e ruído

- **WHEN** a entrada é silêncio, ruído ambiente ou ruído de banda larga sem componente tonal
- **THEN** nenhuma nota é emitida e a interface mostra estado sem sinal ou não confiável

#### Scenario: Ruído moderado

- **WHEN** a relação sinal-ruído cai ao ponto em que a confiança fica abaixo do limiar
- **THEN** o afinador rejeita a leitura em vez de exibir nota com erro maior que o tolerado, e orienta o usuário em pt-BR a reduzir o ruído ou aproximar o instrumento

#### Scenario: Sinal ambíguo

- **WHEN** a entrada contém várias notas simultâneas, acorde ou intervalo sem fundamental única
- **THEN** o afinador não declara a leitura como afinação confiável; quando a confiança permanecer alta por acaso, a limitação monofônica fica documentada e coberta por teste de caracterização

### Requirement: Tratamento de erro de oitava

O afinador MUST documentar as condições em que o período do sinal é ambíguo entre oitavas (harmônicos ímpares fracos, dobra de período) e, no modo guitarra com corda-alvo selecionada, MUST sinalizar “oitava acima/abaixo” quando a frequência medida estiver a até 50 cents de 2× ou ½× a frequência da corda-alvo, sem apresentá-la como afinada.

#### Scenario: Leitura uma oitava acima da corda-alvo

- **WHEN** o usuário seleciona a corda Lá (A2) e a leitura estável corresponde a A3
- **THEN** a interface indica oitava acima da corda-alvo e não exibe “afinado”

### Requirement: Modos cromático e guitarra

O afinador MUST oferecer reconhecimento cromático em toda a faixa operacional e um modo guitarra em afinação padrão (E2, A2, D3, G3, B3, E4) com seleção de corda-alvo; MUST usar A4 = 440 Hz nesta etapa; MUST distinguir o desvio cromático do desvio relativo à corda-alvo.

#### Scenario: Nota fora das cordas soltas

- **WHEN** o modo cromático está ativo e uma nota detectável diferente das cordas soltas é tocada
- **THEN** nota, oitava e cents são exibidos sem restrição às seis cordas

#### Scenario: Modo guitarra com corda-alvo

- **WHEN** o modo guitarra está ativo e o usuário escolhe uma corda
- **THEN** a interface lista as seis referências, exibe o desvio em relação à corda-alvo separadamente da nota cromática observada e nunca afirma correspondência quando a nota observada é de outra corda

### Requirement: Feedback visual acessível e veraz

A tela MUST exibir nota grande, ponteiro centrado em 0 cents e valor em cents, MUST indicar Grave/Afinado/Agudo também por texto (não apenas por cor), MUST funcionar com fonte ampliada e TalkBack, MUST NOT anunciar cada atualização de leitura aos leitores de tela e MUST NOT apresentar leitura antiga como atual quando a captura parar ou a confiança cair (uma última leitura rotulada, por até 3 s, não é apresentada como atual).

#### Scenario: Confiança perdida ou captura interrompida

- **WHEN** a leitura deixa de ser confiável ou a captura é interrompida
- **THEN** a nota, o ponteiro e os cents deixam de ser exibidos como leitura ao vivo; a última leitura estável pode permanecer por no máximo 3 s, visualmente atenuada e rotulada como “Última leitura”, sem estado “afinado” e sem anúncio por leitor de tela, e depois é apagada; o estado é descrito em pt-BR sem depender de cor

#### Scenario: Leitor de tela

- **WHEN** o TalkBack está ativo durante uma afinação
- **THEN** mudanças de nota estável e de estado (grave/afinado/agudo) são anunciadas de forma espaçada, sem anúncio a cada evento de análise

### Requirement: Estabilização, taxa de eventos e correção de sessão

O afinador MUST estabilizar leituras exigindo K leituras aceitas recentes (janela de 5 quadros) com dispersão máxima de 50 cents e reportando a mediana, MUST emitir ao JavaScript no máximo 10 eventos por segundo e MUST descartar eventos de sessões já encerradas por identificador de sessão e sequência.

#### Scenario: Troca de nota

- **WHEN** o usuário passa de uma nota para outra
- **THEN** a nota anterior deixa de ser exibida como atual assim que os quadros novos divergirem e a nova nota só é exibida após a estabilização

#### Scenario: Parar e reiniciar

- **WHEN** a análise é parada e uma nova sessão inicia enquanto eventos da sessão anterior estão enfileirados
- **THEN** os eventos antigos são ignorados e nunca exibidos como leitura atual

### Requirement: Privacidade, funcionamento offline e recuperação

O afinador MUST funcionar sem rede, MUST NOT gravar, persistir ou enviar PCM, MUST NOT enviar telemetria e MUST parar a captura e liberar recursos quando a permissão for revogada ou o app sair do primeiro plano, retomando somente por ação explícita do usuário.

#### Scenario: Permissão revogada ou segundo plano

- **WHEN** a permissão de microfone é revogada ou o app deixa o primeiro plano durante a afinação
- **THEN** captura e eventos de pitch cessam, os recursos são liberados e o estado em pt-BR indica que é preciso tocar para retomar
