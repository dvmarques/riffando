# Proposal

## Why

A [GC-013 / issue #23](https://github.com/dvmarques/riffando/issues/23), do [EP-04](https://github.com/dvmarques/riffando/issues/4), é a primeira entrega funcional do subsistema de áudio. A fundação Expo está na `main`, mas não captura PCM; o `app.json` bloqueia explicitamente `android.permission.RECORD_AUDIO`. Sem uma captura nativa comprovada em aparelho real, não há base confiável para afinador, avaliação de notas ou treinamento.

O mantenedor confirmou que dispõe de **celular Android físico e guitarra com amplificador** para validação. O modelo, a versão do Android e os resultados permanecem desconhecidos até a execução dos testes.

## What Changes

### Escopo proposto (CA-01…CA-08)

- Criar um **módulo Expo local Android em Kotlin**, sem novo workspace/package independente, usando `AudioRecord` para captura PCM mono 16-bit. Preferir 48 kHz quando suportado e registrar a configuração efetivamente negociada, com fallback verificado; não presumir o mesmo formato em todos os aparelhos.
- Alterar controladamente a configuração Expo/manifest para permitir `RECORD_AUDIO` (hoje bloqueado); solicitar autorização **apenas após a ação de iniciar captura**, com mensagens pt-BR para concessão, recusa e revogação.
- Isolar a leitura em contexto nativo fora do loop JS, com buffers limitados, liberação idempotente e estados explícitos; não transportar fluxo PCM continuamente pela bridge. Timestamps devem usar relógio monotônico e `AudioTimestamp` quando disponível, comunicando separadamente timestamps estimados/indisponíveis.
- Expor **contrato TypeScript mínimo** para iniciar/parar/consultar estado e receber métricas resumidas (RMS dBFS, pico, clipping estimado, taxa/buffer efetivos, contadores de erros/descontinuidades observáveis). Evitar abstração de seleção de entrada antes de #25.
- Criar **tela técnica de diagnóstico em pt-BR**, acessível, que não se confunda com afinador funcional; atualização de métricas em frequência limitada.
- Tratar interrupções, perda de permissão, erros de leitura, saída do primeiro plano e desmontagem da tela, liberando recursos e impedindo gravação de fundo.
- Captura **offline**, sem armazenar PCM, gravar arquivos, transmitir áudio, incluir telemetria, conta ou servidor. Preservar divisão UI/infraestrutura/domínio e oportunidade de iOS futuro.
- Testar com Android físico e guitarra via amplificador, comparar com ambiente silencioso e registrar modelo/OS/entrada/formato/execução/resultados, sem declarar metas universais de latência ainda não mensuradas.

### Fora do escopo

- Nota musical, Hz de pitch, oitava, cents, algoritmo YIN/pYIN, afinador e feedback musical: [#24](https://github.com/dvmarques/riffando/issues/24).
- Enumeração/seleção de dispositivos USB, roteamento externo e fallback USB → microfone: [#25](https://github.com/dvmarques/riffando/issues/25).
- Redução avançada de ruído, recuperação complexa de dispositivos, classificação musical: [#26](https://github.com/dvmarques/riffando/issues/26).
- DSP C++, clique do metrônomo, calibração de latência ponta a ponta, persistência SQLite, arquivos gravados, iOS executável e distribuição pública.
- Não medir latência de entrada ou queda exata de buffers só com relógio/contador quando o hardware não permitir comprovação; registrar limitações.

### Critérios de aceite da implementação

- **CA-01:** configuração Android permite `RECORD_AUDIO` apenas para captura sob ação do usuário; negar/revogar permissão produz feedback e não inicia/continua o microfone.
- **CA-02:** módulo Android captura PCM real mono 16-bit com configuração efetiva e amostras não silenciosas sob estímulo, sem depender de Expo Go.
- **CA-03:** leitura e buffers nativos limitados, estados start/stop/erro, repetição idempotente e limpeza verificadas; não há fluxo PCM bruto contínuo em JS.
- **CA-04:** timestamps monotônicos com origem/qualidade indicada; indisponibilidade de timestamp de hardware ou latência não comprovada nunca vira dado sintético apresentado como real.
- **CA-05:** diagnóstico pt-BR acessível mostra estado/entrada básica/configuração, RMS/pico/clipping quando mensuráveis, erros e métricas sem alegar afinador.
- **CA-06:** app em segundo plano, desmontagem, interrupção, permissão negada/revogada e erro de leitura interrompem a captura sem travar, com recuperação sob nova ação.
- **CA-07:** ausência de armazenamento/upload de PCM ou telemetria, funcionamento offline, revisão de permissões e licenças; testes automatizados e `npm run validate`, `check:expo`, APK/CI preservados.
- **CA-08:** evidência física em Android real, com guitarra amplificada, silêncio, 2 min contínuos, 10 min de estabilidade, 20 ciclos iniciar/parar, permissões e troca de foreground/background; registrar versão do Android, hardware, método, valores observados, falhas e limites. Sem extrapolar conclusões a outros dispositivos.

## Capabilities

### New Capabilities

- `native-pcm-capture`: captura nativa controlada e diagnóstico de sinal PCM no Android, com privacidade, timestamps e recuperação observáveis.

### Modified Capabilities

Nenhuma. O shell da `mobile-foundation` continua sem solicitar microfone na inicialização; a nova tela de diagnóstico introduz uma capacidade independente com permissão contextual, preservando a spec permanente. A configuração Android e a navegação são pontos de integração, não mudança das obrigações da fundação.

## Impact

Áreas previstas: `app.json`/config plugin se necessário, `modules/` local, `src/infrastructure/` (adapter), `src/features/` e rota técnica, testes JS/nativos, scripts/CI se um gate real exigir, `docs/development/`, `docs/DECISIONS.md` e `CHANGELOG.md`.

A estratégia Kotlin/AudioRecord e o formato inicial são **decisões propostas para o spike**, ainda sujeitas à validação do SDK/Android físico. C++/USB e metas de precisão/latência não são aprovados por esta proposta. Preservar PolyForm Noncommercial e avaliar licenças de novas dependências antes de adicioná-las.

## Aprovação e estado

Esta change formalizou o **Propose** em 28/10/2026. Posteriormente, o mantenedor autorizou **Apply da GC-013** nesta conversa. A PR #60 recebeu código Kotlin, ponte TypeScript, tela de diagnóstico, configuração de `RECORD_AUDIO`, testes iniciais e documentação. Esses commits não constituem comprovação de compilação/funcionamento físico. Testes, Verify, revisão, CI e evidências Android físico são pendências obrigatórias; **archive/sync e merge por squash permanecem não autorizados**.
