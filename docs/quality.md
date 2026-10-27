# Política progressiva de qualidade

O Riffando tem shell Expo implementado e verificado em GC-001/#11. Valide **o que existe** e registre pendências nativas/acessibilidade sem simular entrega.

## Fundação documental preservada

- `npm ci --ignore-scripts` com Node 24, `npm run validate` e `git diff --check` quando disponível.
- O script validate reúne lint Markdown, links, integrações OpenSpec, smoke/validação estrita, lint JS, tipos e testes de tooling/UI. Preservar execução Linux/Windows.
- Revisar PR, artefatos OpenSpec e evidências de CI no commit final; skipped não significa aprovado.
- Skills próprias verificadas por `npm run check:agent-skills` quando presentes. Não modificar artefatos OpenSpec gerados manualmente.
- Sem gravações/credenciais, novas dependências runtime ou mudanças globais de agente.

## Fundação mobile implementada e evolução futura

- TypeScript estrito, lint compatível React Native, testes unitários de domínio e persistência/migrações, UI mobile e builds Android reproduzíveis.
- Testes E2E em journeys reais, acessibilidade com leitor de tela e dispositivos, responsividade/tamanho de texto, estados vazios e falhas.
- Áudio: dispositivos/OS/entrada (microfone ou USB), condições, latência, interrupções, revogação de permissões e limites. Expo Go não valida módulos nativos.
- Revisor especializado de áudio/latência: ativação futura, somente quando houver captura, DSP ou agendamento implementados; hoje não há código a revisar e ele não é obrigatório em PRs de documentação ou tooling.
- Avaliar hooks para formatação/proteção de gerados; CI por impacto com verificação integral antes do merge; métricas de execução/flakiness; release e distribuição beta.
- Abrir escopo futuro e aprovar antes de instalar ferramentas. Não criar jobs que chamem scripts inexistentes.

## Critério de conclusão

Tasks verificáveis concluídas, evidências verdadeiras, revisão e CI verde, archive/sync autorizado na PR e novo CI antes de squash, conforme [AGENTS.md](../AGENTS.md).
