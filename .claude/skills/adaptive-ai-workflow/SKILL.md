---
name: adaptive-ai-workflow
description: Classificar risco e orquestrar mudanças no Riffando com OpenSpec, Codex e Claude, preservando gates.
---

# Workflow adaptativo — Riffando

Leia AGENTS.md antes desta skill. A política de OpenSpec está em openspec/config.yaml. Use docs/agent-context-map.md para escolher contexto e docs/models.md apenas quando seleção de modelo for relevante.

## Classificar (maior risco prevalece)
- **Fast:** documentação interna, ajustes mecânicos e tooling localizado, sem mudança no app, contratos ou comportamento. Exige artefatos e gates aplicáveis.
- **Standard:** bug reproduzível ou comportamento localizado, sem API/arquitetura/permissão/dados críticos.
- **Critical:** arquitetura, áudio/captura/latência, permissão e privacidade, dados/migração, compatibilidade Android/iOS, segurança, acessibilidade transversal ou mudanças entre módulos.

Promova ao descobrir impacto maior. Duas tentativas sem progresso exigem diagnóstico, mais contexto e eventual modelo/revisor de maior capacidade, não repetição cega nem redução de testes.

## Fluxo
1. Issue e fonte GitHub: verificar duplicatas, critérios, dependências e autorização. Explore é estritamente somente leitura.
2. Consultar AGENTS.md e contexto relevante; consultar changes ativas.
3. Branch isolada; propose com artefatos oficiais; revisar decisões antes de apply. Não confundir hipótese com aprovação.
4. Apply autorizado em incrementos; testes e evidências proporcionais; revisão do diff e changelog.
5. Verify com `npm run validate`, checks adicionais reais e CI no SHA correto. Registrar limitações.
6. PR para main; revisão e CI. Somente tasks concluídas + autorização permitem sync/archive na branch da PR; revalidar e obter CI verde no commit final; squash autorizado. Exceção técnica apenas se aprovada e documentada em AGENTS.md.

Não iniciar as 41 tarefas do app nem instalar dependências mobile por esta skill. Se houver demanda de revisão especializada, use revisão humana ou subagent apropriado sem presumir sua execução.
