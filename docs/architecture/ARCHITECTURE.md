# Arquitetura — Riffando (proposta)

## Stack

- React Native + Expo + TypeScript; Expo Router.
- Zustand para estado de interface e sessão.
- SQLite com migrações; avaliar Drizzle ORM.
- Zod para validação nas fronteiras.
- react-native-svg e Reanimated para interface e visualizações.
- Jest para unidades, testes de integração e Maestro para fluxos E2E (a validar).
- GitHub Actions para lint, tipos, testes e builds conforme viabilidade.

## Organização proposta

```text
riffando/
  apps/mobile/app/
  apps/mobile/src/features/
    tuner/ metronome/ fretboard/ exercises/
    practice/ studio/ progress/ settings/
  apps/mobile/src/design-system/
  apps/mobile/src/infrastructure/
  apps/mobile/src/shared/
  apps/mobile/modules/audio-engine/
  packages/music-theory/
  packages/exercise-engine/
  packages/scoring-engine/
  docs/product/
  docs/architecture/
  docs/adr/
  .github/workflows/
```

A estrutura é uma proposta e pode ser simplificada após a prova de conceito.

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
