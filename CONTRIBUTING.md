# Como contribuir com o Riffando

Obrigado pelo interesse em melhorar o Riffando! Este projeto é desenvolvido com foco em português brasileiro e aprendizado de guitarra.

## Antes de começar

- Leia o [README](README.md) e a [licença](LICENSE).
- O projeto usa **PolyForm Noncommercial 1.0.0**, uma licença de código público com restrição comercial; não é uma licença open source aprovada pela OSI.
- Consulte as issues e discussões existentes antes de abrir propostas duplicadas.
- Para mudanças relevantes, abra uma issue explicando motivação, escopo e critérios de aceite antes de implementar.

## Fluxo de contribuição

Siga as políticas de [AGENTS.md](AGENTS.md) e as regras de artefatos em `openspec/config.yaml`. O [guia rápido de IA](docs/development/AI_WORKFLOW.md) apresenta instalação e comandos. Resumo do fluxo:

1. Issue e escopo pequeno → Explore somente leitura → Propose OpenSpec.
2. Revisão da proposta e aprovação de decisões arquiteturais antes de Apply.
3. Implementação autorizada → testes/Verify → revisão do diff e código.
4. PR para `main` → CI verde → code review.
5. Concluir todas as tarefas da change → archive/sync autorizado na branch da PR → revisar e validar o diff final/CI → merge autorizado sempre por squash. Exceção apenas por restrição concreta de integração prévia, documentada e aprovada conforme AGENTS.md.

Registre mudanças relevantes no [CHANGELOG](CHANGELOG.md), na versão em andamento, sob `Added`, `Changed` ou `Fixed`, identificando a change OpenSpec ou issue e seu efeito. A convenção de versões e datas está em AGENTS.md.

Use branches `feat/<issue>-<descricao>`, `fix/...`, `chore/...` ou `docs/...` e Conventional Commits. Os templates GitHub orientam evidências e limites. `Refs #N` para escopo parcial; `Closes #N` somente para entrega integral.

Node.js 24: `npm ci --ignore-scripts`, `npm run ai:setup` e `npm run validate`. Não há ainda código ou comandos de teste/lint/typecheck/build mobile; adicioná-los junto à fundação aprovada, sem workflows dependentes de scripts inexistentes.

## Idioma e qualidade

- Interface, mensagens e documentação voltadas ao usuário devem priorizar **pt-BR**.
- Código e identificadores podem seguir convenções técnicas estabelecidas no projeto.
- Não inclua chaves, credenciais, dados pessoais ou gravações de terceiros sem autorização.
- Para mudanças de áudio, descreva dispositivos testados, fonte de entrada (microfone/USB), latência e limitações conhecidas.
- Respeite licenças de bibliotecas, samples, imagens e demais dependências.

## Direitos autorais e contribuições

Ao enviar uma contribuição, você declara ter direito de submetê-la e concorda que ela seja disponibilizada sob a licença vigente do projeto, salvo acordo expresso diferente. **Isso não transfere automaticamente seus direitos autorais ao mantenedor nem concede, por si só, autorização para relicenciar sua contribuição comercialmente.**

Se futuramente o projeto desejar oferecer licenças comerciais que incluam contribuições de terceiros, será necessário obter as permissões correspondentes, por exemplo por meio de um acordo de contribuição (CLA) específico, revisado juridicamente. Até lá, **não presuma** que contribuições externas podem ser incluídas em uma edição comercial separada.

Não envie conteúdo de terceiros sem licença compatível ou autorização adequada.

## Conduta

Mantenha as interações respeitosas, objetivas e inclusivas. Críticas técnicas são bem-vindas; ataques pessoais, assédio e discriminação não são.

## Segurança

Não divulgue publicamente vulnerabilidades exploráveis com detalhes sensíveis antes de coordenar a correção com os mantenedores. Use os mecanismos de reporte privado do GitHub, caso estejam habilitados.
