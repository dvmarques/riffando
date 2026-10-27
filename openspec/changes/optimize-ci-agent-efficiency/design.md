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
