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

- [ ] 4.1 Corrigir a validação em Windows/CRLF e validar em CI Linux/Windows. Correção local validada no Windows; pendente evidência remota da matriz.
- [x] 4.2 Atualizar dependências Markdown vulneráveis e registrar changelog. `npm audit`: 0 vulnerabilidades; KaTeX 0.18.2 validado.
- [x] 4.3 Executar segunda revisão com Claude Code e corrigir os problemas encontrados. Isolamento CODEX_HOME/XDG_DATA_HOME e regressão em ai:check; ver VALIDATION.md.
- [ ] 4.4 Atualizar evidências e descrição da PR com os resultados reais.

## 5. Após autorização futura

- [ ] 5.1 Obter aprovação e autorização explícita para merge.
- [ ] 5.2 Após merge, atualizar issue e sincronizar/arquivar a change em PR de acompanhamento autorizado.
