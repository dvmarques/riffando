# Tasks — GC-014 (planejadas; nenhuma implementada)

## 1. Refinar e medir
- [ ] 1.1 Inspecionar contrato e implementação atuais da GC-013 e specs permanentes; documentar impactos reais, permissões e ciclo de vida.
- [ ] 1.2 Comparar YIN/autocorrelação e alternativa viável em sinais sintéticos, estabelecendo limiares de confiança e limitações reproduzíveis; decidir algoritmo com evidências.
- [ ] 1.3 Definir contrato PitchEvent, mapeamento de nota/oitava/cents, política de estados sem sinal e orçamento de eventos/latência.

## 2. Motor nativo
- [ ] 2.1 Integrar cálculo de pitch em worker nativo existente sem duplicar captura nem transmitir PCM cru ao JS.
- [ ] 2.2 Implementar gate de energia/confiança, estados incertos e estabilização com limites documentados.
- [ ] 2.3 Testar interrupções, permissões, ciclo de vida, buffers e erro sem retenção de PCM.

## 3. Domínio e interface
- [ ] 3.1 Implementar conversão musical de F0 para nota/oitava/cents com testes e convenções de cifras/pt-BR.
- [ ] 3.2 Criar seletor cromático/guitarra e UI acessível de nota grande, ponteiro, cents, estados e controles.
- [ ] 3.3 Validar comportamento de atualização, TalkBack, texto ampliado e offline.

## 4. Verificação
- [ ] 4.1 Testar tons determinísticos, silêncio, ruído, harmônicos, out-of-range, oitavas, mudanças bruscas e sinais fracos/fortes.
- [ ] 4.2 Realizar matriz Android físico com seis cordas e desafinação, distância/volume, 10 min e 20 start/stop; registrar aparelho, API, build SHA, método e resultados reais.
- [ ] 4.3 Executar `npm run validate`, `npm run check:expo`, testes Kotlin e build Android; verificar CI e acessibilidade, documentando comandos e evidências.
- [ ] 4.4 Revisar licenças, privacidade, arquitetura, docs/DECISIONS.md, CHANGELOG.md, guias de áudio e limitações; revisão técnica do diff.

> Não iniciar tarefas de Apply antes de autorização explícita. Archive/sync e squash requerem gates e autorizações posteriores.
