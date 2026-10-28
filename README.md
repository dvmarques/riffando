# Riffando 🎸

**Toque. Aprenda. Evolua.**

Riffando é um projeto de aplicativo para aprender e praticar guitarra, criado com foco em **português brasileiro**, experiência acessível e acompanhamento da evolução musical.

> **Estado:** fundação Expo implementada e validada na PR #53. Há um shell de navegação; recursos musicais ainda não estão implementados e não há release publicada.

## Retomar o projeto em outra conversa ou agente

**Comece pelo [Contexto mestre do projeto](docs/PROJECT_CONTEXT.md).** Ele contém as decisões já tomadas, o estado real do trabalho, as pendências e a ordem recomendada de execução. Consulte também o [registro de decisões](docs/DECISIONS.md), o [PRD](docs/product/PRD.md), o [roadmap](docs/product/ROADMAP.md) e as [issues](https://github.com/dvmarques/riffando/issues).

> Para continuar com outro assistente: “Leia o repositório `dvmarques/riffando`, começando por `docs/PROJECT_CONTEXT.md`, `docs/DECISIONS.md` e as issues abertas. Confirme o estado atual antes de propor ou executar alterações.”

## Desenvolvimento com IA

Leia [AGENTS.md](AGENTS.md) e o [guia de desenvolvimento com IA](docs/development/AI_WORKFLOW.md). OpenSpec 1.15.0 possui integrações oficiais para Codex e Claude Code. GitHub guarda propostas, tarefas, decisões e validações.

```bash
npm ci --ignore-scripts
npm run ai:setup
npm run validate
```

Requer Node.js 24. Estes comandos preparam e verificam ferramentas; não iniciam o aplicativo. Veja [evidências e limitações](docs/development/VALIDATION.md) e [políticas GitHub](docs/development/GITHUB.md). Fluxo padrão: concluir todas as tarefas, arquivar/sincronizar a change na PR e então fazer merge por squash, respeitando as autorizações. Exceções por restrição concreta estão em AGENTS.md.

## Visão do produto

Uma experiência integrada para guitarristas iniciantes e intermediários, com:

- Afinador cromático com entrada pelo microfone e, quando suportado, interface de áudio USB.
- Metrônomo com compassos, subdivisões e progressão de velocidade.
- Braço de guitarra interativo, acordes, escalas e afinações alternativas.
- Exercícios progressivos, rotinas de prática e histórico local.
- Treinador de notas e ritmo com feedback em português, baseado em análise de áudio.
- Em etapas futuras, reprodução de áudio local, repetição de trechos e acompanhamento de progresso.

As funcionalidades serão desenvolvidas **por fases**; esta lista representa a visão do produto, não recursos já entregues.

## Princípios

- **Português brasileiro em primeiro lugar:** interface, instruções e feedback.
- **Privacidade e funcionamento offline:** priorizar dados locais, sem exigir conta ou servidor.
- **Transparência:** distinguir medições reais, estimativas e avaliações do usuário.
- **Acessibilidade:** leitura clara, controles adequados e suporte a tecnologias assistivas.
- **Baixo custo:** evitar infraestrutura recorrente.

## Tecnologia planejada

- React Native, Expo e TypeScript.
- Expo Router para navegação.
- SQLite para persistência local.
- Motor de áudio nativo para captura, análise e temporização; implementação e viabilidade ainda sujeitas a validação em dispositivos reais.
- Android como primeira plataforma, com arquitetura preparada para eventual suporte a iOS.

## Roadmap resumido

1. Fundação: documentação, arquitetura, projeto mobile, qualidade e CI.
2. Ferramentas musicais: teoria, braço interativo e metrônomo.
3. Captura de áudio, afinador, exercícios e sessões.
4. Treinador inteligente e indicadores de progresso.
5. Estúdio de áudio local, acessibilidade, testes e publicação Android.

O roadmap e as estimativas serão refinados conforme a implementação e as validações evoluírem.

## Licenciamento

O código deste projeto está disponível sob a **[PolyForm Noncommercial License 1.0.0](LICENSE.md)**. Isso significa que o código é público e pode ser utilizado nos termos da licença, **mas não é software open source segundo a definição da OSI**, pois há restrições ao uso comercial.

O licenciamento comercial exige autorização separada dos titulares dos direitos aplicáveis. O nome e os elementos de identidade visual seguem a política descrita em [TRADEMARKS.md](TRADEMARKS.md).

## Contribuições

Contribuições não comerciais e propostas de melhorias são bem-vindas. Antes de enviar código, leia [CONTRIBUTING.md](CONTRIBUTING.md), inclusive as condições de direitos autorais.

## Aviso

O projeto está em fase inicial. Informações de compatibilidade de dispositivos, precisão de análise musical e datas de lançamento só serão confirmadas após testes.

## Diagnóstico experimental de áudio (GC-013)

A captura PCM nativa Android está em implementação na [PR #60](https://github.com/dvmarques/riffando/pull/60) e **não foi validada em aparelho físico nem integrada à main**. Consulte o [guia de captura de áudio](docs/development/AUDIO_CAPTURE.md) para permissões, testes e limitações. Não confundir essa implementação em branch com afinador funcional.

## Executar a fundação

Consulte [guia mobile](docs/development/MOBILE.md) para versões, instalação, testes, development build e APK interno Android, e [dependências/riscos](docs/development/DEPENDENCIES.md). Builds Windows/Linux e smoke Android validados; testes/evidências no guia. Sem release publicada.
