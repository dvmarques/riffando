# Tasks

Implementação futura de GC-001/#11. **0 tarefas executadas nesta proposta.** Iniciar somente após aprovação registrada da topologia e nova solicitação Apply. Critérios CA-01…CA-06 em proposal.md; contratos na spec; evidências devem apontar comandos, SHA e resultados reais. Autorizações, archive e merge ficam no checklist da PR.

## 1. Matriz e instalação (CA-01)

- [ ] 1.1 Selecionar SDK estável suportado e matriz Expo/React/RN/TS/Node/npm/JDK/Android SDK; registrar versões e licenças diretas/transitivas relevantes em guia de dependências, verificando fontes das versões e peers antes da adição.
- [ ] 1.2 Ampliar manifest existente para app único e gerar lock sem perder tooling/override; verificar instalação limpa em Windows e Linux, diagnóstico Expo e ausência de React/RN nativos duplicados; documentar pré-requisitos e resolução de incompatibilidades.

## 2. Tipagem e fronteiras (CA-01, CA-03)

- [ ] 2.1 Configurar TS estrito, aliases e lint de dependências/ciclos conforme design; verificar typecheck e lint no código efetivo, sem pacotes/diretórios vazios para representar features futuras.
- [ ] 2.2 Verificar resolução consistente em Metro/Jest/TS/ESLint e rejeição de import proibido por alias e caminho relativo; registrar prova negativa revertida e documentar direção das dependências.

## 3. Shell e comportamento (CA-02, CA-04)

- [ ] 3.1 Criar rotas início/informações com Expo Router e recursos pt-BR, retorno Android e indicação de recursos em preparação; incluir testes RNTL/Jest de ida/volta e indisponibilidade, verificando ações por nome/papel acessível.
- [ ] 3.2 Adicionar recuperação de erro e carregamento somente quando necessário; testar falha injetada/recuperação sem publicar controle de debug, sem stack trace sensível, e documentar estados do shell.
- [ ] 3.3 Verificar manifest/configuração sem microfone, USB, telemetria ou upload solicitados pelo shell; documentar distinção entre transporte de desenvolvimento e funcionamento offline do APK embarcado.

## 4. Testes e comandos JS (CA-03, CA-05)

- [ ] 4.1 Configurar jest-expo/RNTL e scripts lint/typecheck/test/test:ci/check:expo/export:android reais; verificar suite não vazia, relatórios e exportação Android, documentando limites dos mocks.
- [ ] 4.2 Agregar checks JS ao validate preservando todos os checks atuais; provar falha por erro TS, lint e teste de comportamento temporariamente quebrado, reverter regressões e registrar resultados.

## 5. Android e smoke (CA-04, CA-05)

- [ ] 5.1 Configurar CNG e development build, comandos start/android/build:android portáveis; verificar prebuild limpo e APK de validação com JS embarcado e assinatura interna de debug sem credenciais de loja, documentando execução Windows/Linux e rollback.
- [ ] 5.2 Executar smoke do APK instalado: modo avião, Metro desligado, início a frio, navegação/voltar e reabertura; anexar SHA, artefato, aparelho/AVD e OS/API, passos/resultados e limitações sem alegar validação de áudio.
- [ ] 5.3 Verificar TalkBack, fonte Android 200%, alvos de toque e contraste conforme design; corrigir bloqueios e registrar evidência por tela e ambiente, complementando testes de rótulos/ações.

## 6. CI reproduzível (CA-05)

- [ ] 6.1 Preservar matriz documental Linux/Windows e adicionar qualidade JS/diagnóstico/exportação e smoke Windows; verificar instalação por lock, relatórios, gates reais e permissão contents:read sem secrets em PR.
- [ ] 6.2 Adicionar compilação Android Linux com JDK/SDK documentados, cache/timeout e upload do APK por 7 dias; verificar CI do SHA com logs distintos para bundle e compilação nativa, incluindo falha controlada revertida do build.
- [ ] 6.3 Definir gate agregado e nomes estáveis dos checks, validar falha/cancelamento dos jobs obrigatórios e documentar configuração recomendada de proteção sem alterar branch protection nesta entrega.

## 7. Integração, documentação e revisão (CA-06)

- [ ] 7.1 Consolidar README/guia de execução com comandos realmente executados em Windows/Linux, troubleshooting, versões/licenças e evidências Android; atualizar ADR/contexto/decisões/arquitetura conforme aprovação efetiva e CHANGELOG na versão em andamento com define-mobile-foundation/#11.
- [ ] 7.2 Conferir cada cenário da spec e CA-01…CA-06 contra evidência, executar npm run validate, lint, tipos, testes, exportação e APK; revisar diff/código e registrar resultados, riscos restantes e CI verde sem declarar features fora do escopo como entregues.
