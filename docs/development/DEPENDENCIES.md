# Dependências da fundação

## Escopo mínimo

Expo 58.0.19, React 19.3.0/RN 0.88.0, Router 58.0.26 e peers linking/constants/log-box/metro-runtime/screens/safe-area-context nas versões exatas do manifest/lock; dev-client para build nativo. React DOM 19.3.0 alinha peer transitivo, sem plataforma web. Não há estado global, banco ou motor de áudio.

TS 6.0.3, tipos React 19.3.0, ESLint 9.39.4/config-expo 58.0.4/import 2.32.0, Jest 30.5.2/preset Expo 58.0.12, tipos Jest 30.0.0/RNTL 14.1.0 e doctor 1.21.5. test-renderer é transitivo do preset SDK atual, sem base de testes legada react-test-renderer. Tooling anterior/override KaTeX preservados.

## Licenças e inventário

Runtime novo declara MIT; TypeScript usa Apache-2.0 e cross-spawn (portabilidade Windows) MIT. Conferir LICENSE/NOTICE das versões instaladas e preservar avisos/autoria. Transitivas no lock incluem MIT, ISC, Apache, BSD, BlueOak, Python/PSF, CC0/CC-BY. node-forge oferece BSD-3-Clause OR GPL-2.0; alternativa permissiva exige preservar seus avisos. lightningcss/binários têm MPL-2.0 (transformação CSS do Metro/CLI); dados caniuse-lite têm CC-BY-4.0. A classificação não equivale a licença integralmente revisada: inventário final/notices do APK e obrigações de redistribuição ainda estão pendentes. Manter PolyForm Noncommercial e direitos de terceiros; sem autorização de publicação ou relicenciamento.

## Risco identificado em 26/10/2026

npm audit reportou cinco entradas high propagadas do CLI Expo, de node-forge 1.4.0 e zod 3. Registro consultado não oferece patch forge superior a 1.4.0; correção Zod é major 4, mas CLI exige major 3. Não aplicar audit fix --force, downgrade para SDK 54 ou override major incompatível. Shell não processa esses certificados/dados externos; risco do tooling não está eliminado. Remediação ou aprovação específica do risco permanece pendente antes de declarar conclusão.

[Advisory forge](https://github.com/advisories/GHSA-86w9-cpqp-85rv), [advisory Zod](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5). Conferir LICENSE/NOTICE dos pacotes instalados. Expo doctor 20/20 não é auditoria de segurança/licença.
