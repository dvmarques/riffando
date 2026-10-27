# Arquitetura — Riffando (decisões e propostas)

## Stack

- Aprovado para a fundação: app único na raiz, React Native + Expo + TypeScript estrito e Expo Router, com separação UI/domínio/infraestrutura. Implementação depende de nova solicitação Apply.
- Demais bibliotecas abaixo são direções/propostas futuras conforme registro de decisões, não autorização de instalação em #11.
- Zustand para estado de interface e sessão.
- SQLite com migrações; avaliar Drizzle ORM.
- Zod para validação nas fronteiras.
- react-native-svg e Reanimated para interface e visualizações.
- Jest para unidades, testes de integração e Maestro para fluxos E2E (a validar).
- GitHub Actions para lint, tipos, testes e builds conforme viabilidade.

## Organização da fundação — aprovada para planejamento

Decisão do mantenedor em 26/10/2026, [ADR 0001](../adr/0001-mobile-foundation.md) e [issue #11](https://github.com/dvmarques/riffando/issues/11): app único na raiz. Árvore conceitual, criar diretórios somente quando houver código necessário:

```text
riffando/
  app/                         rotas Expo Router
  src/features/foundation/     início e informações
  src/domain/                  regras puras futuras
  src/infrastructure/          adaptadores futuros
  src/shared/ui/               componentes reutilizados
  src/shared/i18n/             recursos pt-BR
  modules/                     módulos Expo locais futuros
  docs/
```

Não criar packages/workspaces desnecessários. Migração para monorepo exige segundo consumidor concreto ou API/versionamento independente comprovadamente necessário, novo ADR e preservação de comportamento com testes. Essa decisão elimina a antiga exigência de monorepo de GC-001; não autoriza código mobile.

## Fronteiras

1. UI/feature: telas, estado, componentes, acessibilidade e localização.
2. Domínio: teoria musical, exercícios, expectativas, cálculo de resultados e regras puras testáveis.
3. Persistência: repositórios SQLite, migrações, backup e versões de algoritmo.
4. Áudio: captura, agendamento de clique, DSP e eventos musicais.

## Motor de áudio

Proposta: núcleo DSP C++ reutilizável, adaptador Android/Kotlin inicialmente e adaptador iOS/Swift posteriormente; ponte via Expo Modules API. **Não assumir viabilidade sem spike em dispositivo físico.** Expo Go isoladamente pode ser insuficiente; prever development builds.

Interface de alto nível (conceitual):

```ts
interface AudioEngine {
  listInputs(): Promise<AudioInput[]>;
  selectInput(id: string): Promise<void>;
  startAnalysis(config: AnalysisConfig): Promise<void>;
  stopAnalysis(): Promise<void>;
  subscribe(listener: (event: MusicalEvent) => void): () => void;
}
```

Eventos: PitchDetected, NoteOnset, InputChanged, SignalQualityChanged, AudioEngineError. Processamento PCM e timestamps devem permanecer nativos; enviar ao JS apenas eventos relevantes em lotes controlados.

Pipeline candidato: PCM + timestamps monotônicos → filtragem/energia → detecção de altura (YIN/pYIN ou alternativa validada) → ataques → notas/cents/confiança → comparação com exercício → feedback.

## Precisão e limitações

- Treinador inicial monofônico; acordes/distorção não devem ser avaliados como notas isoladas confiáveis.
- Calibração de latência de entrada/saída, atenção a Bluetooth e mudanças de dispositivo.
- Clique do metrônomo deve ser agendado fora do ciclo JS.
- Definir política de eventos brutos: limitar volume, retenção e exportação.

## Persistência e privacidade

SQLite local; arquivos de áudio em armazenamento privado quando possível. Exportação/importação explícitas, migrações versionadas e testes de recuperação. Sem telemetria ou upload automático por padrão.

## Metas técnicas exploratórias

- 60 FPS em telas principais.
- Inicialização até 2 segundos em aparelho de referência.
- Afinador com erro alvo até ±5 cents em sinal limpo e estável.
- Jitter de clique alvo inferior a 5 ms em teste controlado.

Esses números são hipóteses de engenharia, não resultados garantidos.

## Qualidade

Testes de domínio, migrações, fluxos de sessão, perda de áudio, desconexão USB, permissões e acessibilidade. Matriz de aparelhos reais e logs locais de diagnóstico sem gravações sensíveis.

## Fundação de GC-001/#11 — implementada e verificada

A change [define-mobile-foundation](../../openspec/changes/define-mobile-foundation/proposal.md) e a issue #11 descrevem os mesmos escopo/exclusões e CA-01…CA-06 para app único. O [design](../../openspec/changes/define-mobile-foundation/design.md) detalha fronteiras, dependências mínimas/adiadas, diagnóstico Windows/Linux, CNG/development build, testes e gates. A arquitetura foi implementada e as 20 tarefas verificadas na PR #53. Há shell, testes e builds; áudio/desempenho musical permanecem fora do escopo.

## Estado da fundação

GC-001 foi implementado e as 20 tarefas verificadas na PR #53. Matriz, evidências Windows/Linux, TalkBack e limites em [guia mobile](../development/MOBILE.md). Archive/sync/squash autorizados pelo mantenedor em 27/10/2026, condicionados a revisão sem bloqueadores e CI verde no commit final.
