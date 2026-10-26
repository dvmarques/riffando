# Changelog

## Unreleased

- Preparar o fluxo de desenvolvimento com OpenSpec 1.15.0, instruções comuns para Codex e Claude Code, templates GitHub e CI de documentação/ferramentas ([PR #52](https://github.com/dvmarques/riffando/pull/52); Refs #1, #14).
- Compatibilizar a verificação das integrações geradas com checkouts Windows CRLF e atualizar dependências de validação Markdown.
- Isolar `CODEX_HOME` e `XDG_DATA_HOME` nos wrappers OpenSpec para que setup e validação não removam prompts Codex globais nem usem schemas pessoais.
- Definir conclusão de todas as tarefas antes de archive/sync e merge sempre por squash; restringir integração prévia a exceções documentadas/aprovadas e remover tarefas administrativas circulares.
