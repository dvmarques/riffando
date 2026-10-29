# Spec Delta

## Purpose

Disponibilizar uma captura PCM Android de uso explícito, com diagnósticos e tratamento seguro de estado, como base para ferramentas musicais futuras, sem afirmar detecção de notas ou latência validada antes de medição em aparelho real.

## ADDED Requirements

### Requirement: Permissão de microfone explícita e mínima

O aplicativo MUST solicitar `RECORD_AUDIO` somente após uma ação explícita para iniciar a captura, MUST tratar negativa/revogação e MUST NOT solicitar permissões não relacionadas a esta funcionalidade.

#### Scenario: Iniciar com permissão ausente

- **WHEN** o usuário toca em “Iniciar captura” sem permissão de microfone concedida
- **THEN** o aplicativo solicita a permissão no contexto, inicia somente após autorização e indica estado em pt-BR

#### Scenario: Permissão negada ou revogada

- **WHEN** a permissão é negada ou revogada antes ou durante a captura
- **THEN** nenhuma captura fica ativa, os recursos são liberados e o usuário recebe mensagem e opção de recuperação sem solicitação em loop

### Requirement: Captura PCM real em Android

O módulo nativo MUST capturar PCM mono 16-bit de `AudioRecord` fora do thread de interface/JS, MUST registrar a configuração efetiva e MUST indicar falha quando a inicialização ou leitura não produzir amostras utilizáveis.

#### Scenario: Estímulo acústico

- **WHEN** captura é autorizada em Android compatível e um som audível chega ao microfone
- **THEN** o módulo observa frames PCM e atualiza métricas de amplitude reais sem apresentar nota, pitch ou cents

#### Scenario: Formato solicitado indisponível

- **WHEN** o formato preferencial não é suportado ou a inicialização falha para ele
- **THEN** o módulo tenta somente fallback compatível e documentado ou retorna erro explícito, indicando frequência/canal/encoding efetivos quando iniciado

### Requirement: Buffer nativo limitado e ciclo de estados seguro

A captura MUST usar worker nativo e buffers limitados, MUST expor início/parada idempotentes, MUST liberar recursos após falha e MUST NOT enviar um fluxo contínuo de amostras PCM brutas ao JS.

#### Scenario: Início e parada repetidos

- **WHEN** o usuário inicia, interrompe e repete a captura ou executa ações concorrentes
- **THEN** permanece no máximo uma sessão ativa, os recursos antigos são liberados e não há gravação residual

### Requirement: Tempo monotônico e qualidade de timestamp explícita

O módulo MUST usar referência temporal monotônica para eventos de captura e MUST distinguir timestamps válidos retornados por `AudioRecord` de indisponibilidade; MUST NOT chamar esse retorno de prova independente de timestamp de hardware nem afirmar medição de latência ponta a ponta sem método externo.

#### Scenario: Timestamp AudioRecord indisponível

- **WHEN** o Android não fornece `AudioTimestamp` válido
- **THEN** o diagnóstico informa a limitação e, se houver derivação, distingue sua origem sem inventar tempo de captura de hardware

### Requirement: Diagnóstico acessível em português brasileiro

A UI MUST mostrar captura parada/ativa/erro, configuração efetiva e métricas de RMS/pico/clipping ou indicação de indisponibilidade em pt-BR, com nomes acessíveis, leitura ampliada e informação não dependente somente de cor.

#### Scenario: Sinal presente e silêncio

- **WHEN** o usuário alterna de silêncio para guitarra amplificada
- **THEN** a tela apresenta métricas observáveis com atualização limitada e sem representar frequência musical ou pontuação

#### Scenario: Erro nativo

- **WHEN** a captura falha ou perde seu recurso
- **THEN** a tela fornece erro contextualizado e opção de reinício manual, sem stack trace privada

### Requirement: Captura apenas em primeiro plano e privacidade por padrão

O módulo MUST encerrar ao sair do primeiro plano/desmontar a tela ou perder a condição necessária de captura e MUST NOT gravar, persistir, enviar PCM, exigir internet ou coletar telemetria.

#### Scenario: Aplicativo vai para segundo plano

- **WHEN** o aplicativo perde o primeiro plano durante a captura
- **THEN** a captura é interrompida, os recursos são liberados e não há retomada automática

#### Scenario: Execução offline

- **WHEN** o APK é iniciado sem rede e o usuário autoriza o microfone
- **THEN** a captura e o diagnóstico funcionam localmente sem upload, conta, servidor ou gravação em arquivo

### Requirement: Verificação automatizada e física rastreável

A entrega MUST manter validações do repositório e MUST incluir prova de captura em aparelho Android físico com modelo, versão, origem do APK, passos, resultados e limitações; emulador ou mocks MUST NOT substituir a evidência física.

#### Scenario: Aceite de hardware

- **WHEN** a issue for considerada pronta para fechamento
- **THEN** os testes automatizados/build/CI foram concluídos e há resultados registrados de silêncio, guitarra amplificada, captura longa, ciclos e permissão/background em Android físico

#### Scenario: Teste físico não executado

- **WHEN** somente testes simulados ou smoke de emulador tiverem sido executados
- **THEN** a validação física fica pendente e a implementação não é declarada integralmente concluída
