## ADDED Requirements

### Requirement: Classificação proporcional

O fluxo de agentes SHALL classificar mudanças em Fast, Standard e Critical, promovendo risco sem reduzir os gates obrigatórios.

#### Scenario: Mudança em áudio ou persistência

- **WHEN** uma tarefa envolve captura de áudio ou migração de dados
- **THEN** o agente identifica perfil Critical e requisitos de evidência do domínio

#### Scenario: Documentação interna sem impacto no app

- **WHEN** uma tarefa altera apenas documentação interna ou tooling localizado
- **THEN** o agente identifica perfil Fast, mantendo artefatos e validações aplicáveis

### Requirement: Contexto e modelos rastreáveis

O fluxo SHALL orientar leitura seletiva de fontes existentes e escolha de modelo baseada no custo efetivo de uma entrega validada.

#### Scenario: Retomar uma tarefa

- **WHEN** outro agente assume a change
- **THEN** localiza políticas, referências, branch, critérios e resultados sem depender da conversa

### Requirement: Skills próprias consistentes

O repositório SHALL verificar que a skill própria publicada para Codex e Claude tem conteúdo equivalente sem modificar artefatos oficiais gerados.

#### Scenario: Detectar divergência

- **WHEN** uma cópia Claude da skill diverge da fonte própria
- **THEN** a verificação falha sem reescrever arquivos automaticamente

#### Scenario: Skills oficiais preservadas

- **WHEN** a verificação das integrações compara os diretórios de skills com os gerados pelo OpenSpec
- **THEN** somente a skill própria é desconsiderada e as skills oficiais continuam exigidas com conteúdo idêntico
