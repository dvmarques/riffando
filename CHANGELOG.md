# Changelog

Aqui são registradas as principais inclusões, correções e evoluções do Riffando.

O formato segue as convenções do Keep a Changelog. As mudanças são organizadas
por versão e pelas changes correspondentes do OpenSpec.

## Histórico de versões

### [0.0.1] - Em andamento

#### Added

- `paridade-revisores-codex-claude` (Refs #54; PR #62) - Revisores consultivos de arquitetura e acessibilidade disponíveis para Codex, com verificação de equivalência ao Claude.

- `implement-native-pcm-capture` (Refs #23; PR #60) - Módulo local Kotlin/AudioRecord para captura PCM em memória, ponte de métricas e tela técnica pt-BR; testes e comprovação em Android físico ainda pendentes.

- `issue-54-adaptive-ai-workflow` (issue #54) - Fluxo adaptativo Fast/Standard/Critical, mapa de contexto, política de modelos e qualidade, revisores consultivos e validação de skills próprias entre Codex e Claude, sem app implementado.

- `define-mobile-foundation` (Refs #11; PR #53) - Apply autorizado: shell Expo com rotas/erro pt-BR, TS estrito, testes, diagnósticos e CI Android/emulador. Em validação, sem funcionalidades musicais.

- `define-mobile-foundation` (Refs #11/GC-001) - Proposta OpenSpec da fundação React Native + Expo + TypeScript, com comparação app único/monorepo, ADR proposto, fronteiras, dependências, testes, CI e critérios de aceite; sem implementação mobile.

- `setup-ai-development` (PR #52; Refs #1, #14) - Preparação do fluxo de desenvolvimento com OpenSpec 1.15.0, instruções comuns para Codex e Claude Code, integrações oficiais, templates GitHub e CI de documentação/ferramentas em Linux e Windows. Sem implementação do aplicativo.

#### Changed

- `paridade-revisores-codex-claude` (Refs #59; PR #62) - CI de PRs seleciona validações por impacto, com fallback completo e gate que verifica resultados esperados.

- `implement-native-pcm-capture` (Refs #23; PR #60) - Change concluída (17/17 tarefas) arquivada com sync da spec `native-pcm-capture`; validada em CI e no Galaxy S25 FE (um aparelho, sem conclusões de latência ou precisão).

- `implement-native-pcm-capture` (Refs #23; PR #60) - Decisão de start/stop, estado e leitura de timestamp do módulo Kotlin extraídos para funções puras (`CaptureLifecycle.kt`) com 6 testes JUnit (start idempotente, bloqueio durante parada, 20 ciclos, concorrência, timestamp sem valores inventados); verificação JUnit do CI passa a exigir as duas suites. Novos testes Jest para segundo plano, diálogo de permissão e recusa por `AUDIO_STOPPING`. Validação física no Galaxy S25 FE registrada em `AUDIO_CAPTURE.md`.

- `implement-native-pcm-capture` (Refs #23; PR #60) - Actions do CI com runtime Node.js 24: `setup-android` v3→v4, `upload-artifact` v4→v7 e `download-artifact` v4→v8 (matriz Node 24.21.0/npm 12.2.1/Java 17 preservada); teste impede retorno de majors Node 20.

- `implement-native-pcm-capture` (Refs #23; PR #60) - Patches da matriz Expo 58 e lockfile npm sincronizados em runner reproduzível, testes unitários Kotlin integrados ao CI e revisão da liberação segura da captura.

- `optimize-ci-agent-efficiency` (issue #57; PR #58) - Cache de build Gradle somente no CI (`--build-cache`, prova negativa de compilação sem cache), npm sem auditoria/funding no CI, timeout do job Windows de 30 para 45 min, invariantes do workflow testadas, guia de agentes com leitura incremental, arquivos gerados fora do contexto padrão e consulta direcionada de logs. Jobs, checks, gate e cobertura preservados; mudanças de frequência de build e proteção de branch apenas propostas.

- `define-mobile-foundation` (Refs #11; PR #53) - Change concluída arquivada com sync da spec mobile-foundation; referências e contexto atualizados.

- `define-mobile-foundation` (Refs #11; PR #53) - Arquivo de licença renomeado para LICENSE.md e referências locais atualizadas, preservando integralmente seu conteúdo.

- `define-mobile-foundation` (Refs #11; PR #53) - Evidências finais de build Windows/Linux e acessibilidade consolidadas; README remove referência condicional a versões MIT anteriores por solicitação do mantenedor. Licença atual preservada.

- `ci-skip-draft-prs` - O CI de Pull Request deixa de executar em PRs Draft e passa a rodar ao marcar Ready for review; push na `main` e execução manual não mudam.

- `define-mobile-foundation` (Refs #11; PR #53) - Aceite temporário do risco de tooling registrado; smoke Android offline/fontes 100% e 200% comprovado por artefatos. Correções de SDK/JVM revisadas e política de Draft preservada; TalkBack e fonte 200% confirmados manualmente pelo mantenedor em Pixel 7 API 36.

- `define-mobile-foundation` (Refs #11/GC-001; PR #53) - Arquitetura de app único aprovada para planejamento e alinhada à issue/ADR/instruções; diagnóstico Windows/Linux, gates success/failure/cancelled/skipped/ausência e loading condicional refinados com cenários, tarefas abertas e critérios de aceite compartilhados. Sem Apply, código mobile ou alteração de workflows.

- `setup-ai-development` (PR #52) - Conclusão de todas as tarefas antes de archive/sync e merge sempre por squash; integração prévia restrita a exceções documentadas/aprovadas. Autorizações e ações administrativas ficam no checklist da PR, evitando tarefas circulares.
- `setup-ai-development` (PR #52) - Changelog organizado por versão em andamento e categorias Added, Changed e Fixed, com identificação da change/issue e efeito objetivo; convenção de fechamento com data em português brasileiro e abertura da próxima versão em andamento.

#### Fixed

- `implement-native-pcm-capture` (Refs #23; PR #60) - Revisão de arquitetura/acessibilidade: sessão não fica presa se `Thread.start()` falhar com `Error`, contexto nativo ausente passa a reportar `AUDIO_CONTEXT_UNAVAILABLE`, erro de captura é anunciado como região ativa, métricas usam vírgula decimal (pt-BR) e a negativa permanente orienta a ativar o microfone em Configurações.

- `implement-native-pcm-capture` (Refs #23; PR #60) - A ponte `nativeCapture` passa a rejeitar (e não lançar de forma síncrona) quando o módulo nativo está ausente, evitando falha na limpeza da tela de diagnóstico e no listener de AppState no Expo Go; teste de regressão adicionado.

- `define-mobile-foundation` (Refs #11; PR #53) - Patches Expo, dev-client e Router atualizados conforme catálogo SDK 58; checagem compatível preservada e inventário/licenças reavaliados. Auditoria passou a três avisos high de tooling em Zod, já aceitos temporariamente.

- `define-mobile-foundation` (Refs #11; PR #53) - Revisão Claude corrigiu estados documentais contraditórios, suporte a Unicode em propriedades Android, teste do gate com jobs/formato reais e identificação da evidência manual de TalkBack.

- `define-mobile-foundation` (Refs #11; PR #53) - Build Windows seleciona CMake 3.31.6/Ninja 1.12.1 e diagnóstico exige caminhos longos para corrigir causa observada no CI sem alterar toolchain global do colaborador.

- `define-mobile-foundation` (Refs #11; PR #53) - Diagnóstico compara SDK efetivo e JVM launcher/daemon, rejeita properties ambíguos e usa SDK explícito; comandos Windows usam escaping próprio e a instalação chama a CLI Android diretamente para preservar os identificadores de pacotes. Governança de #54 preservada na atualização da branch.

- `setup-ai-development` (PR #52) - Comparação das integrações oficiais compatível com checkouts Windows CRLF, preservando a detecção de alterações reais no conteúdo.
- `setup-ai-development` (PR #52) - Dependências de validação Markdown atualizadas para corrigir vulnerabilidades; markdownlint-cli2 0.24.0 e override limitado de KaTeX 0.18.2.
- `setup-ai-development` (PR #52) - Isolamento de CODEX_HOME e XDG_DATA_HOME nos wrappers OpenSpec para que setup e validação preservem prompts Codex globais e ignorem schemas pessoais.
