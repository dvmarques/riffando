# Spec Delta

## Purpose

Oferecer uma base Android reproduzível, offline e acessível para o desenvolvimento incremental do Riffando, com evidências distintas para qualidade JavaScript e execução nativa.

## ADDED Requirements

### Requirement: Instalação e execução reproduzíveis

O projeto MUST oferecer instalação por lockfile, versões de ferramentas documentadas e comandos reais para executar, verificar e compilar a fundação Android sem depender de serviço pago.

#### Scenario: Checkout limpo

- **WHEN** um colaborador com os pré-requisitos documentados instala o projeto em Windows ou Linux
- **THEN** a instalação usa o lockfile versionado e os comandos documentados iniciam o ambiente de desenvolvimento sem configuração pessoal oculta

#### Scenario: Ambiente incompatível

- **WHEN** Node, JDK ou Android SDK não satisfazem a matriz documentada
- **THEN** o diagnóstico identifica a incompatibilidade e a documentação orienta a correção sem declarar sucesso de build

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

O shell MUST diferenciar carregamento transitório, recurso ainda indisponível e erro inesperado recuperável, com mensagem pt-BR e ação clara, sem expor stack trace ou dados sensíveis.

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

O CI MUST executar validação documental, lint, tipos, testes de comportamento, exportação JavaScript e compilação Android, falhar em regressões e disponibilizar APK de validação sem credenciais de publicação.

#### Scenario: Regressão detectável

- **WHEN** uma alteração introduz erro de tipo, violação de lint, falha de cenário de navegação ou erro de build
- **THEN** o check correspondente falha com diagnóstico e impede que a fundação seja declarada concluída

#### Scenario: Evidências distintas

- **WHEN** uma PR da fundação passa nos checks
- **THEN** há resultados separados de testes JavaScript, exportação e APK nativo, sem interpretar mocks ou bundle como prova de áudio, USB ou compatibilidade universal
