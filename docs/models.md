# Seleção de modelos e eficiência

Escolha um modelo disponível capaz de concluir a tarefa com qualidade. A escolha não fixa nomes, preços, capacidades ou franquias: essas condições mudam. Não use um modelo econômico para reduzir gates obrigatórios.

| Trabalho | Escolha inicial | Escalonamento |
| --- | --- | --- |
| Mecânico (links, docs, formatação) | rápido/econômico | ambiguidade ou falha reproduzida |
| Padrão (regras de domínio, bugs localizados) | equilibrado | impacto transversal ou duas tentativas improdutivas |
| Crítico (áudio nativo, dados, segurança, arquitetura, acessibilidade complexa) | maior capacidade/revisão independente | ampliar evidências e avaliação de especialistas |

## Por fase

- Explore e proposal: contexto seletivo; revisar decisões arquiteturais.
- Design/specs: raciocínio proporcional a riscos e alternativas.
- Apply: validar incrementos reais, não executar comandos fictícios.
- Verify e code review: revisão independente e testes do SHA atual.
- Sync/archive: seguir gates existentes; custo baixo não autoriza archive prematuro.

## Medição sem alegações infundadas

Em tarefas comparáveis, registrar ferramenta, versão, esforço, escopo, tokens quando disponíveis, duração, tentativas, testes aprovados, regressões e retrabalho. Compare taxa de sucesso e custo efetivo por entrega validada. Campos não expostos devem ser registrados como **não disponíveis**, nunca estimados como medição. Não enviar segredos ou dados privados a serviços de benchmark.
