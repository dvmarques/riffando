# Dependências da fundação

## Escopo mínimo

Expo 58.0.19, React 19.3.0/RN 0.88.0, Router 58.0.26 e peers linking/constants/log-box/metro-runtime/screens/safe-area-context nas versões exatas do manifest/lock; dev-client para build nativo. React DOM 19.3.0 alinha peer transitivo, sem plataforma web. Não há estado global, banco ou motor de áudio.

TS 6.0.3, tipos React 19.3.0, ESLint 9.39.4/config-expo 58.0.4/import 2.32.0, Jest 30.5.2/preset Expo 58.0.12, tipos Jest 30.0.0/RNTL 14.1.0 e doctor 1.21.5. test-renderer é transitivo do preset SDK atual, sem base de testes legada react-test-renderer. Tooling anterior/override KaTeX preservados.

## Licenças e inventário

Runtime novo declara MIT; TypeScript usa Apache-2.0 e cross-spawn (portabilidade Windows) MIT. Conferir LICENSE/NOTICE das versões instaladas e preservar avisos/autoria. Transitivas no lock incluem MIT, ISC, Apache, BSD, BlueOak, Python/PSF, CC0/CC-BY. node-forge oferece BSD-3-Clause OR GPL-2.0; alternativa permissiva exige preservar seus avisos. lightningcss/binários têm MPL-2.0 (transformação CSS do Metro/CLI); dados caniuse-lite têm CC-BY-4.0. A classificação não equivale a licença integralmente revisada: inventário final/notices do APK e obrigações de redistribuição ainda estão pendentes. Manter PolyForm Noncommercial e direitos de terceiros; sem autorização de publicação ou relicenciamento.

## Risco identificado em 26/10/2026

npm audit reportou cinco entradas high propagadas do CLI Expo, de node-forge 1.4.0 e zod 3. Registro consultado não oferece patch forge superior a 1.4.0; correção Zod é major 4, mas CLI exige major 3. Não aplicar audit fix --force, downgrade para SDK 54 ou override major incompatível. Shell não processa esses certificados/dados externos; risco do tooling não está eliminado. O aceite temporário específico está registrado abaixo; reavaliar a remediação conforme esse aceite.

[Advisory forge](https://github.com/advisories/GHSA-86w9-cpqp-85rv), [advisory Zod](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5). Conferir LICENSE/NOTICE dos pacotes instalados. Expo doctor 20/20 não é auditoria de segurança/licença.

cross-spawn 7.0.6 (MIT, LICENSE instalado conferido) executa npm/Gradle em Windows com escaping próprio, sem concatenar argumentos em shell manual. TypeScript 6.0.3 tem LICENSE.txt Apache-2.0. Expo Router não inclui LICENSE no tarball consultado; conferir também o LICENSE da revisão upstream Expo correspondente antes do inventário final.

## Evidência do JavaScript de produção

Exportação real com source maps (expo export --platform android --source-maps --output-dir dist/android-audit): 1.130 fontes mapeadas, 42 pacotes instalados identificados, licenças MIT/ISC. node-forge, Zod, lightningcss e caniuse-lite não aparecem nesse grafo JavaScript. O [inventário](JAVASCRIPT_DEPENDENCIES.json) registra versões e arquivos LICENSE/NOTICE encontrados; preservação de avisos continua obrigatória. Isso não é inventário nativo completo do APK nem elimina o risco de executar tooling vulnerável.

## Aceite temporário do risco de tooling

O mantenedor aceitou explicitamente nesta conversa manter temporariamente os avisos transitivos do CLI Expo. Escopo: tooling de desenvolvimento/build; não autoriza novos usos desses módulos no produto, exposição pública do servidor, supressão de auditoria ou dispensa de Android/TalkBack. Dev server limitado a localhost. Reavaliar ao atualizar SDK/transitivas e antes de publicação de loja; registrar remediação quando houver patch compatível.

## Avaliação da matriz e obrigações relevantes

A seleção de versões, peers e licenças relevantes da tarefa 1.1 foi avaliada: matriz exata em config/toolchain.json/lock, instalação limpa e Expo doctor aprovados; compilação Linux e APK offline comprovados no run 40412254969. A validação nativa Windows permanece uma entrega separada, ainda pendente.

Os frameworks Expo/Router e React Native usam MIT: [licença upstream Expo SDK 58](https://github.com/expo/expo/blob/sdk-58/LICENSE) e [licença React Native 0.88.0](https://github.com/facebook/react-native/blob/v0.88.0/LICENSE). A ausência de LICENSE no tarball do Router foi confrontada com o upstream correspondente. O inventário do JavaScript identifica os 42 pacotes efetivamente mapeados e seus arquivos de licença. Manter copyright/licenças MIT/ISC/Apache/BSD e NOTICE aplicáveis ao redistribuir; MPL exige preservar suas condições para componentes cobertos, e CC-BY exige atribuição aos dados cobertos. Essas transitivas de transformação não foram encontradas no JavaScript exportado.

A avaliação desta fundação não autoriza publicação de loja nem afirma um inventário nativo integral do APK. Antes de distribuição pública, consolidar os avisos das dependências efetivamente distribuídas, inclusive nativas, conforme suas licenças. Essa limitação não é apresentada como risco aceito de licenciamento nem como auditoria jurídica concluída.
