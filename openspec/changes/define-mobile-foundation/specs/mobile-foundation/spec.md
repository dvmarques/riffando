# Spec Delta

## Purpose

Oferecer uma base Android reproduzível, offline e acessível para o desenvolvimento incremental do Riffando, com evidências distintas para qualidade JavaScript e execução nativa.

Escopo, exclusões e CA-01…CA-06 canônicos em [proposal.md](../../proposal.md), reproduzidos na issue #11. Arquitetura aprovada para planejamento em 26/10/2026; Apply autorizado separadamente; cenários abaixo definem o contrato, cuja entrega deve ser verificada em tasks.md.

## ADDED Requirements

### Requirement: Aplicativo único com camadas separadas

A fundação MUST manter um único aplicativo na raiz, com TypeScript estrito, navegação Expo Router e separação UI/domínio/infraestrutura, sem packages/workspaces sem consumidor real. A aprovação dessa arquitetura MUST NOT ser interpretada como autorização de implementação.

#### Scenario: Estrutura da fundação futura

- **WHEN** a estrutura entregue for conferida após implementação separadamente autorizada
- **THEN** há um app na raiz e um lockfile, sem monorepo ou pacotes vazios, e as dependências entre camadas são verificáveis

#### Scenario: Autorização restrita ao planejamento

- **WHEN** a arquitetura e a issue são alinhadas nesta revisão
- **THEN** as tarefas continuam abertas e nenhum Apply, código mobile, archive/sync ou merge é executado

### Requirement: Instalação e execução reproduzíveis

O projeto MUST oferecer instalação por lockfile, versões de ferramentas documentadas e comandos reais para executar, verificar e compilar a fundação Android sem depender de serviço pago.

#### Scenario: Checkout limpo

- **WHEN** um colaborador com os pré-requisitos documentados instala o projeto em Windows ou Linux
- **THEN** a instalação usa o lockfile versionado e os comandos documentados iniciam o ambiente de desenvolvimento sem configuração pessoal oculta

### Requirement: Diagnóstico de ambiente verificável

O diagnóstico MUST verificar executáveis, versões e componentes contra a matriz oficial do SDK selecionado em Windows e Linux, encerrar com código não zero para pré-requisito ausente/incompatível e distinguir esses erros de falha de compilação, com causa, versão esperada/observada e correção em pt-BR.

#### Scenario: Pré-requisito ausente

- **WHEN** node/npm, java/javac, sdkmanager ou componente Android requerido não está disponível no caminho configurado
- **THEN** check:env ou check:env:android falha antes de compilar, nomeia o item ausente e orienta instalação/configuração sem tratá-lo como erro do código

#### Scenario: Ambiente incompatível

- **WHEN** a versão observada por node --version, npm --version, java -version, javac -version ou sdkmanager --list (seção Installed packages) diverge da matriz suportada registrada
- **THEN** o diagnóstico falha, informa esperado/observado, comando e fonte da matriz, incluindo divergência entre JAVA_HOME e o JDK efetivo do Gradle

#### Scenario: Matriz oficial e ambientes válidos

- **WHEN** a matriz é escolhida na implementação autorizada e os checks executam em Windows e Linux
- **THEN** documentação registra SDK exato, fontes oficiais versionadas Expo/RN/Android, versões observadas e logs de sucesso por OS, sem escolher toolchain arbitrária

#### Scenario: Falha de compilação após diagnóstico válido

- **WHEN** pré-requisitos passam mas prebuild ou Gradle falha
- **THEN** build:android termina com erro de compilação, identifica etapa e log, sem renomeá-lo como pré-requisito ausente nem reportar APK válido

### Requirement: Navegação mínima honesta

O shell MUST permitir navegar entre início e informações da fundação, retornar ao início e informar em pt-BR quais recursos ainda não estão disponíveis.

#### Scenario: Ida e retorno

- **WHEN** o usuário abre informações a partir do início e usa voltar na tela ou no Android
- **THEN** retorna ao início sem perder o controle da navegação nem apresentar ferramentas musicais como implementadas

### Requirement: Funcionamento offline e privacidade

O shell instalado MUST iniciar e navegar sem internet, conta ou servidor, sem telemetria, upload, gravação ou solicitação de microfone/USB.

#### Scenario: Inicialização sem Metro

- **WHEN** um APK com JavaScript embarcado é iniciado a frio em modo avião, com Metro desligado
- **THEN** início e informações são utilizáveis sem login, requisição obrigatória à rede ou solicitação de permissão de áudio

### Requirement: Estados e recuperação

O shell MUST exibir carregamento somente durante operação assíncrona real, sem delay artificial; diferenciar recurso indisponível de erro recuperável; e oferecer mensagens/ações pt-BR sem expor stack trace ou dados sensíveis.

#### Scenario: Shell sem operação assíncrona pendente

- **WHEN** início ou informações pode ser exibido imediatamente
- **THEN** o conteúdo aparece sem spinner, timer ou tela de loading artificial, e recursos futuros permanecem indisponíveis

#### Scenario: Operação assíncrona real

- **WHEN** uma operação assíncrona necessária está pendente
- **THEN** loading pt-BR existe apenas enquanto pendente, termina em sucesso/erro e é testado por promessa controlada, sem delay de produção; se não houver tal operação no shell, nenhum loader é criado para atender ao cenário

#### Scenario: Erro de apresentação

- **WHEN** uma falha de renderização é injetada em teste
- **THEN** o usuário encontra mensagem compreensível e ação de tentar novamente ou voltar para início, com recuperação verificada após remoção da falha

#### Scenario: Conteúdo indisponível

- **WHEN** o shell mostra uma área sem conteúdo funcional nesta fase
- **THEN** explica que o recurso está em preparação e não exibe resultados de prática, medições ou avaliações fictícios

### Requirement: Acessibilidade e idioma

O shell MUST oferecer textos e rótulos pt-BR, ordem de foco coerente, controles com papel e nome acessíveis, texto ampliável sem perda de ações e informação que não dependa apenas de cor.

#### Scenario: Leitor de tela e texto ampliado

- **WHEN** o usuário navega com TalkBack e tamanho de fonte Android de 200%
- **THEN** alcança e identifica as ações principais, lê o estado atual e consegue voltar sem sobreposição que impeça interação

### Requirement: Fronteiras verificáveis

O projeto MUST impedir dependências do domínio puro em UI, roteamento, armazenamento, rede e áudio nativo, permitindo testar regras sem inicializar o dispositivo.

#### Scenario: Violação de fronteira

- **WHEN** uma importação proibida é introduzida temporariamente na verificação de arquitetura
- **THEN** o check falha e identifica a dependência indevida, incluindo caminhos relativos que tentem contornar aliases

### Requirement: Gates reais de qualidade e build

O CI MUST preservar checks documentais Linux/Windows, executar instalação, lint, tipos, testes, exportação JS e compilação Android, falhar em regressões e disponibilizar APK de validação sem credenciais de publicação quando build for exigido.

#### Scenario: Regressão detectável

- **WHEN** ocorre falha de instalação, lint, TypeScript, teste de comportamento, exportação JS ou compilação Android
- **THEN** o check correspondente falha com diagnóstico e impede que a fundação seja declarada concluída

#### Scenario: Evidências distintas

- **WHEN** uma PR da fundação executa todos os jobs obrigatórios sem dispensa e passa nos checks
- **THEN** há resultados separados de testes JavaScript, exportação e APK nativo, sem interpretar mocks ou bundle como prova de áudio, USB ou compatibilidade universal

### Requirement: Gate agregado sem sucesso implícito

O gate agregado MUST aprovar somente resultados success de todos os jobs exigidos pela política do SHA/evento. Falha, cancelamento, ausência e skipped de job exigido MUST impedir aprovação. Dispensa por filtro MUST ser explícita, verificável, restrita a jobs opcionais nessa política e relatada como não executada.

#### Scenario: Todos os jobs exigidos aprovados

- **WHEN** a política sem filtros exige todos os jobs, ou a classificação futura de arquivos passa, e cada job exigido termina com success no mesmo SHA/evento
- **THEN** o gate aprova, lista os resultados e exige relatório e APK para build obrigatório

#### Scenario: Job obrigatório falhou

- **WHEN** qualquer job exigido termina com failure, inclusive instalação ou uma de suas etapas de qualidade/build
- **THEN** o gate falha e identifica job/etapa, mesmo se os demais passaram

#### Scenario: Job obrigatório cancelado

- **WHEN** qualquer job exigido termina com cancelled
- **THEN** o gate não aprova; se puder executar, falha com o job cancelado, e se o workflow inteiro for cancelado o check cancelado/ausente não é evidência de aprovação

#### Scenario: Job obrigatório não executado

- **WHEN** um job exigido está skipped, não consta nos resultados, não iniciou ou não terminou
- **THEN** o gate não aprova; ao avaliar resultados finais ausentes/skipped falha e explicita a lacuna em vez de aceitar ausência como success

#### Scenario: Dispensa válida por arquivos

- **WHEN** classificação completa e bem-sucedida comprova alteração somente documental e a política dispensa apenas jobs mobile
- **THEN** checks documentais e classificação continuam exigidos, gate registra jobs mobile como dispensados/não executados e não afirma teste, exportação ou APK executados

#### Scenario: Filtro inválido ou escopo incerto

- **WHEN** há código/configuração/dependência alterada, lista incompleta, erro de classificação ou job dispensado sem evidência válida
- **THEN** política exige todos os jobs mobile e gate rejeita qualquer skip; na implementação inicial todos são exigidos inclusive em PR documental
