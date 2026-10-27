# Changelog

Aqui são registradas as principais inclusões, correções e evoluções do Riffando.

O formato segue as convenções do Keep a Changelog. As mudanças são organizadas
por versão e pelas changes correspondentes do OpenSpec.

## Histórico de versões

### [0.0.1] - Em andamento

#### Added

- `issue-54-adaptive-ai-workflow` (issue #54) - Fluxo adaptativo Fast/Standard/Critical, mapa de contexto, política de modelos e qualidade, revisores consultivos e validação de skills próprias entre Codex e Claude, sem app implementado.

- `define-mobile-foundation` (Refs #11; PR #53) - Apply autorizado: shell Expo com rotas/erro pt-BR, TS estrito, testes, diagnósticos e CI Android/emulador. Em validação, sem funcionalidades musicais.

- `define-mobile-foundation` (Refs #11/GC-001) - Proposta OpenSpec da fundação React Native + Expo + TypeScript, com comparação app único/monorepo, ADR proposto, fronteiras, dependências, testes, CI e critérios de aceite; sem implementação mobile.

- `setup-ai-development` (PR #52; Refs #1, #14) - Preparação do fluxo de desenvolvimento com OpenSpec 1.15.0, instruções comuns para Codex e Claude Code, integrações oficiais, templates GitHub e CI de documentação/ferramentas em Linux e Windows. Sem implementação do aplicativo.

#### Changed

- `define-mobile-foundation` (Refs #11; PR #53) - Change concluída arquivada com sync da spec mobile-foundation; referências e contexto atualizados.

- `define-mobile-foundation` (Refs #11; PR #53) - Arquivo de licença renomeado para LICENSE.md e referências locais atualizadas, preservando integralmente seu conteúdo.

- `define-mobile-foundation` (Refs #11; PR #53) - Evidências finais de build Windows/Linux e acessibilidade consolidadas; README remove referência condicional a versões MIT anteriores por solicitação do mantenedor. Licença atual preservada.

- `ci-skip-draft-prs` - O CI de Pull Request deixa de executar em PRs Draft e passa a rodar ao marcar Ready for review; push na `main` e execução manual não mudam.

- `define-mobile-foundation` (Refs #11; PR #53) - Aceite temporário do risco de tooling registrado; smoke Android offline/fontes 100% e 200% comprovado por artefatos. Correções de SDK/JVM revisadas e política de Draft preservada; TalkBack e fonte 200% confirmados manualmente pelo mantenedor em Pixel 7 API 36.

- `define-mobile-foundation` (Refs #11/GC-001; PR #53) - Arquitetura de app único aprovada para planejamento e alinhada à issue/ADR/instruções; diagnóstico Windows/Linux, gates success/failure/cancelled/skipped/ausência e loading condicional refinados com cenários, tarefas abertas e critérios de aceite compartilhados. Sem Apply, código mobile ou alteração de workflows.

- `setup-ai-development` (PR #52) - Conclusão de todas as tarefas antes de archive/sync e merge sempre por squash; integração prévia restrita a exceções documentadas/aprovadas. Autorizações e ações administrativas ficam no checklist da PR, evitando tarefas circulares.
- `setup-ai-development` (PR #52) - Changelog organizado por versão em andamento e categorias Added, Changed e Fixed, com identificação da change/issue e efeito objetivo; convenção de fechamento com data em português brasileiro e abertura da próxima versão em andamento.

#### Fixed

- `define-mobile-foundation` (Refs #11; PR #53) - Revisão Claude corrigiu estados documentais contraditórios, suporte a Unicode em propriedades Android, teste do gate com jobs/formato reais e identificação da evidência manual de TalkBack.

- `define-mobile-foundation` (Refs #11; PR #53) - Build Windows seleciona CMake 3.31.6/Ninja 1.12.1 e diagnóstico exige caminhos longos para corrigir causa observada no CI sem alterar toolchain global do colaborador.

- `define-mobile-foundation` (Refs #11; PR #53) - Diagnóstico compara SDK efetivo e JVM launcher/daemon, rejeita properties ambíguos e usa SDK explícito; comandos Windows usam escaping próprio e a instalação chama a CLI Android diretamente para preservar os identificadores de pacotes. Governança de #54 preservada na atualização da branch.

- `setup-ai-development` (PR #52) - Comparação das integrações oficiais compatível com checkouts Windows CRLF, preservando a detecção de alterações reais no conteúdo.
- `setup-ai-development` (PR #52) - Dependências de validação Markdown atualizadas para corrigir vulnerabilidades; markdownlint-cli2 0.24.0 e override limitado de KaTeX 0.18.2.
- `setup-ai-development` (PR #52) - Isolamento de CODEX_HOME e XDG_DATA_HOME nos wrappers OpenSpec para que setup e validação preservem prompts Codex globais e ignorem schemas pessoais.
