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

## Refinamento de GC-001/#11 — especificação em revisão

A change [define-mobile-foundation](../../openspec/changes/define-mobile-foundation/proposal.md) e a issue #11 descrevem os mesmos escopo/exclusões e CA-01…CA-06 para app único. O [design](../../openspec/changes/define-mobile-foundation/design.md) detalha fronteiras, dependências mínimas/adiadas, diagnóstico Windows/Linux, CNG/development build, testes e gates. A arquitetura está aprovada para esta proposta; o plano operacional segue em revisão na PR #53 e todas as tarefas de implementação estão abertas. Sem código, build ou comprovação de áudio/desempenho.

## Estado do Apply — 26/10/2026

Após aprovação do plano e autorização separada do mantenedor, GC-001 entrou em implementação na PR #53. Shell de início/informações, recuperação pt-BR, TS estrito, testes, diagnóstico e CI foram adicionados. Resultados e pendências atuais em [guia mobile](../development/MOBILE.md). Esta atualização supera as referências históricas acima a implementação não autorizada/não existente; não indica app completo. Somente tarefas verificadas são concluídas. Demais funcionalidades, inventário final/licenças, risco de transitivas e validação Android/acessibilidade permanecem fora de qualquer declaração de conclusão. Sem archive/merge.

## Fundação verificada — 27/10/2026

As 20 tarefas de GC-001 foram verificadas na branch da PR #53: builds Windows/Linux e sete checks do run 40522664541 aprovados no head a556c82; smoke Android offline, fonte 200% e TalkBack manual confirmados. Evidências, matriz, riscos e limites em [guia mobile](../development/MOBILE.md). Esse registro supera as pendências históricas de shell/build/acessibilidade acima. O aceite de vulnerabilidades é temporário e restrito ao tooling; nenhuma funcionalidade musical, publicação de loja, archive/sync ou merge foi realizada. Alterações documentais posteriores exigem CI do commit final e os gates de autorização permanecem.
