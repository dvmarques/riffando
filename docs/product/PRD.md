# PRD — Riffando (versão 1.0, planejamento)

## Visão

Aplicativo de apoio ao aprendizado e à prática de guitarra, em português brasileiro, para iniciantes e intermediários. Combina ferramentas musicais, exercícios progressivos e feedback mensurável sobre afinação e ritmo.

**Estado:** especificação, sem implementação. Android primeiro; preparar arquitetura para iOS.

## Princípios

- pt-BR como idioma principal, com estrutura para internacionalização.
- Offline-first, sem cadastro obrigatório, sem servidor e sem custo recorrente de infraestrutura.
- Dados e gravações locais, privacidade por padrão.
- Feedback educativo, compreensível e sem falsa precisão.
- Acessibilidade e desempenho em aparelhos Android reais.

## Escopo funcional

| ID | Área | Requisitos |
|---|---|---|
| RF-01 | Afinador | Cromático; nota, oitava, cents e confiança; afinações EADGBE, Drop D e personalizadas; referência A4 configurável; microfone e USB quando suportados |
| RF-02 | Metrônomo | 30–240 BPM, 2/4, 3/4, 4/4, 6/8, subdivisões, acentos, Tap Tempo e progressão |
| RF-03 | Braço interativo | Notas, intervalos, acordes e escalas; maiores, menores e pentatônicas; reprodução de notas |
| RF-04 | Prática | Exercícios por nível, rotinas personalizadas, sessões, metas e histórico |
| RF-05 | Treinador | Detecção **monofônica** de altura e ataques; comparação de tempo/nota; feedback com confiança e limitações explícitas |
| RF-06 | Estúdio | Importação de áudio local, player, loop A/B, velocidade variável e associação a exercícios |
| RF-07 | Progresso | Indicadores de prática, tendências de BPM e acurácia, separando métricas medidas e avaliações manuais |
| RF-08 | Configuração | Entrada de áudio, calibração, acessibilidade, exportação/importação de backup |
| RF-09 | Localização | Interface, tutoriais, glossário, feedback e acessibilidade em pt-BR; cifras e nomes das notas |

## Fora do escopo inicial

Reconhecimento polifônico completo, transcrição de músicas comerciais, colaboração social, sincronização em nuvem, login, IA generativa e aulas por streaming.

## Experiência

- Onboarding breve para escolher nível e configurar áudio.
- Iniciante: explicações acessíveis e glossário para termos como bend, palm mute e hammer-on.
- Intermediário: metas de BPM, estabilidade, precisão e histórico de evolução.
- Feedback exemplo: “Você antecipou algumas notas; reduza para 75 BPM e tente novamente.”
- Dados insuficientes ou áudio ruidoso devem produzir “não foi possível avaliar com confiança”, não nota arbitrária.

## Critérios de sucesso (a validar)

- Fluxos essenciais funcionam sem internet.
- Sessões salvas e restauradas corretamente após reinício.
- Entrada USB tratada com fallback para microfone e mensagens claras.
- Exercícios e relatórios distinguem medição de estimativa.
- UI, mensagens de erro e acessibilidade em português brasileiro.

## Fases

1. Fundação e qualidade.
2. Teoria, braço interativo e metrônomo.
3. Áudio, afinador e sessões.
4. Treinador e progresso.
5. Estúdio, backup, acessibilidade e lançamento.

Estimativa exploratória: cerca de 21 semanas em tempo parcial, sujeita a descoberta técnica e disponibilidade.

## Riscos

Latência variável entre dispositivos, USB Audio class/roteamento, vazamento do clique no microfone, ruído/distorção e identificação errada de notas, persistência e migrações, compatibilidade futura com iOS.

## Licença

Código sob PolyForm Noncommercial 1.0.0. Distribuições comerciais exigem permissões adicionais dos respectivos titulares dos direitos. O nome e a identidade visual seguem TRADEMARKS.md.
