## Context
Riffando usa OpenSpec 1.15.0, Codex/Claude e CI documental. A skill adaptativa do Admin DS é referência, não uma dependência a ser copiada literalmente.

## Goals / Non-Goals
Orientação simples, verificável e portátil entre agentes; preservar generated skills. Não iniciar GC-001…041, configurar releases nem alterar CI mobile inexistente.

## Decisions
- Manter `AGENTS.md` como fonte de políticas; mapa/modelos/qualidade são guias especializados.
- Criar skill própria em `.agents/skills`; script separado verifica sincronia com Claude; **não tocar** skills OpenSpec geradas.
- Revisores Claude são consultivos e condicionais; sem obrigatoriedade artificial para tarefas sem UI ou áudio.
- Classificação Critical cobre arquitetura, áudio, privacidade, persistência e acessibilidade mobile; nenhuma categoria dispensa gates.
- Documentar fase 2 somente como intenção futura, não instalar dependências.

## Risks
Conflito com setup oficial: sincronizador limitado ao diretório da skill própria e teste de equivalência. Mudança CRLF: normalização somente de finais de linha. Divergência de conteúdo: check falha, não corrige sozinho. No app futuro, reavaliar regras com código real.
