# Design preliminar

## Alternativas

1. Manter CI integral em todos os PRs e otimizar apenas cache: risco baixo, menor ganho de latência.
2. CI rápido em PRs e completo no gate de integração: maior ganho, exige revisar proteção de branch, condições de skip e aprovação explícita.
3. CI por caminhos com matriz seletiva: útil, mas perigoso se mudanças de scripts/dependências escaparem; usar fallback completo.

## Proposta técnica para validação

- Preservar job agregador obrigatório e comportamento determinístico para skipped/cancelled.
- Centralizar validações JavaScript, sem duplicá-las no job Windows, desde que não se perca cobertura de compatibilidade necessária.
- Reutilizar caches npm/Gradle com chaves versionadas por lockfile e toolchain; não cachear segredos nem resultados de testes como evidência.
- Separar feedback rápido de builds nativos pesados somente após mapear os gates atuais e obter aprovação de eventual alteração.
- Medir tempo de parede e consumo de runners separadamente; em Windows considerar multiplicadores de cobrança aplicáveis.
- Agentes: manter AGENTS.md, mapa seletivo e skill Fast/Standard/Critical; reduzir releituras e repetição de verificações intermediárias, sem suprimir revisão/validação final.

## Riscos

- Jobs skipped interpretados como sucesso por branch protection.
- Path filters omitirem alterações transversais.
- Cache obsoleto e builds não reproduzíveis.
- Economias de tokens sem medição verificável.

## Decisões pendentes

Aprovação da política de CI, matriz mínima obrigatória por tipo de alteração e estratégia de rollout.

## Decisão para rollout seguro

**Fase 1 (autorizada para Apply sem mudança de política):** manter os mesmos jobs, disparos, gates e testes; otimizar apenas execução redundante e documentação. Remover a instalação global repetida de npm **somente após** verificar a versão disponível nos runners e a compatibilidade com o lockfile; preservar as verificações Windows de compatibilidade, que não são necessariamente equivalentes às de Linux. Validar o ganho em PR não Draft.

**Fase 2 (dependente de aprovação específica):** avaliar CI rápido com jobs nativos condicionais e gate completo em integração. Não aplicar filtros por paths ou alterar frequência dos builds nesta fase sem decisão explícita. O job agregador deve rejeitar falha, cancelamento e ausência de qualquer job obrigatório; `skipped` só será aceito com política aprovada, condições verificáveis e testes automatizados do agregador.

### Matriz atual preservada na fase 1

| Alteração | Docs Linux/Windows | JS Linux | Windows + APK | Android Linux | Emulador | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| Documentação, JS, nativa, scripts, dependências ou CI | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Obrigatório | Obrigatório |

Drafts continuam sem executar os jobs conforme política existente. A fase 1 não altera proteção de branch. A fase 2 exige confirmação dos checks obrigatórios configurados no GitHub e aprovação do mantenedor.

## Baseline preliminar de três execuções bem-sucedidas

| Run | Duração de parede (created → updated) | Resultado | Observação |
| --- | --- | --- | --- |
| [#31](https://github.com/dvmarques/riffando/actions/runs/40522664541) | 17min40s | success | 7 jobs |
| [#34](https://github.com/dvmarques/riffando/actions/runs/40529243530) | 25min55s | success | 7 jobs |
| [#36](https://github.com/dvmarques/riffando/actions/runs/40563957799) | 29min24s | success | 7 jobs |

Média de parede: **24min20s**; mediana: **25min55s**. Os tempos incluem agendamento e não representam soma de minutos faturáveis. A API consultada nesta revisão forneceu nomes/conclusões dos jobs, mas não seus horários individuais; a medição detalhada de runner-minutes, cache e a comparação por SHA/configuração ainda estão pendentes. Runs cancelados e drafts skipped não entram na média.
