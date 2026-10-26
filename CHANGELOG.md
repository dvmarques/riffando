# Changelog

Aqui são registradas as principais inclusões, correções e evoluções do Riffando.

O formato segue as convenções do Keep a Changelog. As mudanças são organizadas
por versão e pelas changes correspondentes do OpenSpec.

## Histórico de versões

### [0.0.1] - Em andamento

#### Added

- `setup-ai-development` (PR #52; Refs #1, #14) - Preparação do fluxo de desenvolvimento com OpenSpec 1.15.0, instruções comuns para Codex e Claude Code, integrações oficiais, templates GitHub e CI de documentação/ferramentas em Linux e Windows. Sem implementação do aplicativo.

#### Changed

- `setup-ai-development` (PR #52) - Conclusão de todas as tarefas antes de archive/sync e merge sempre por squash; integração prévia restrita a exceções documentadas/aprovadas. Autorizações e ações administrativas ficam no checklist da PR, evitando tarefas circulares.
- `setup-ai-development` (PR #52) - Changelog organizado por versão em andamento e categorias Added, Changed e Fixed, com identificação da change/issue e efeito objetivo; convenção de fechamento com data em português brasileiro e abertura da próxima versão em andamento.

#### Fixed

- `setup-ai-development` (PR #52) - Comparação das integrações oficiais compatível com checkouts Windows CRLF, preservando a detecção de alterações reais no conteúdo.
- `setup-ai-development` (PR #52) - Dependências de validação Markdown atualizadas para corrigir vulnerabilidades; markdownlint-cli2 0.24.0 e override limitado de KaTeX 0.18.2.
- `setup-ai-development` (PR #52) - Isolamento de CODEX_HOME e XDG_DATA_HOME nos wrappers OpenSpec para que setup e validação preservem prompts Codex globais e ignorem schemas pessoais.
