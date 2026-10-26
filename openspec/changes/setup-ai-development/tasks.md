## 1. Preparação

- [x] 1.1 Ler documentos, backlog e padrões dos repositórios de referência antes das alterações.
- [x] 1.2 Confirmar versão estável, documentação oficial e ausência de OpenSpec anterior.
- [x] 1.3 Registrar proposta e design com escopo autorizado e limitações.

## 2. Configuração

- [x] 2.1 Instalar OpenSpec fixo e gerar integrações oficiais Codex/Claude com verify.
- [x] 2.2 Criar AGENTS central, CLAUDE de referência e guia de continuidade.
- [x] 2.3 Preparar templates GitHub, política de labels/milestones e CI real.

## 3. Validação e revisão

- [x] 3.1 Executar npm run validate, smoke de lifecycle e conferir geração oficial.
- [x] 3.2 Revisar diff, consistência documental e limitações de execução dos agentes.
- [x] 3.3 Abrir um único PR, acompanhar CI e corrigir falhas para revisão humana.

- [x] 3.4 Ajustar a separação documental aprovada: políticas em AGENTS, regras OpenSpec em config.yaml e tutorial enxuto sem duplicação normativa.

## 4. Revisão complementar da PR #52

- [x] 4.1 Corrigir a validação em Windows/CRLF e validar em CI Linux/Windows. CI 40393245594 aprovado nas duas plataformas (commit f950833).
- [x] 4.2 Atualizar dependências Markdown vulneráveis e registrar changelog. `npm audit`: 0 vulnerabilidades; KaTeX 0.18.2 validado.
- [x] 4.3 Executar segunda revisão com Claude Code e corrigir os problemas encontrados. Isolamento CODEX_HOME/XDG_DATA_HOME e regressão em ai:check; ver VALIDATION.md.
- [x] 4.4 Atualizar evidências e descrição da PR com os resultados reais. VALIDATION.md e PR #52 atualizados após as duas revisões.

## 5. Processo de conclusão aprovado pelo mantenedor

- [x] 5.1 Documentar tasks concluídas → archive/sync → merge por squash, com exceção restrita à integração prévia necessária.
- [x] 5.2 Reclassificar autorização, archive, merge e fechamento administrativo como gates da PR, preservando os critérios reais de implementação.
- [x] 5.3 Validar a documentação, regras OpenSpec e consistência do fluxo atualizado. npm run validate e git diff --check aprovados; política, specs, contexto, roadmap e template alinhados.

As antigas tarefas administrativas 5.1/5.2 foram substituídas pelo checklist de conclusão da PR, não marcadas como executadas. Aprovação/autorização, archive e squash ainda não foram realizados. Nenhuma entrega depende de integração prévia nesta change; aplica-se o fluxo padrão.
