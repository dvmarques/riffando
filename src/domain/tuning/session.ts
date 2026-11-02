/** Descarta eventos de sessões encerradas ou fora de ordem; evita exibir leitura antiga como atual. */
export function createSessionFilter() {
  let sessionId: number | null = null;
  let lastSequence = 0;
  return {
    begin(id: number) {
      sessionId = id;
      lastSequence = 0;
    },
    end() {
      sessionId = null;
      lastSequence = 0;
    },
    accept(event: { sessionId: number; sequence: number }) {
      if (sessionId === null || event.sessionId !== sessionId || event.sequence <= lastSequence) return false;
      lastSequence = event.sequence;
      return true;
    },
  };
}
