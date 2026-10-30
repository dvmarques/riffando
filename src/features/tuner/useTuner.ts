import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, PermissionsAndroid, Platform } from 'react-native';
import { createSessionFilter } from '@/domain/tuning/session';
import { nativeTuner, type PitchEvent, type TunerSession } from '@/infrastructure/audio/nativeTuner';

export type TunerStatus = 'idle' | 'requestingPermission' | 'starting' | 'listening' | 'stopping' | 'error';

export const errorLabels: Record<string, string> = {
  AUDIO_PERMISSION_DENIED: 'O acesso ao microfone não foi autorizado.',
  AUDIO_PERMISSION_REVOKED: 'O acesso ao microfone foi interrompido ou revogado.',
  AUDIO_INITIALIZATION_FAILED: 'Não foi possível iniciar o microfone neste aparelho.',
  AUDIO_READ_FAILED: 'A leitura do microfone foi interrompida.',
  AUDIO_CONTEXT_UNAVAILABLE: 'O microfone não está disponível neste momento.',
  AUDIO_STOPPING: 'O microfone ainda está sendo liberado. Tente novamente.',
  AUDIO_STOP_TIMEOUT: 'O microfone demorou para encerrar. Tente novamente ou reinicie o aplicativo.',
  AUDIO_MODE_CONFLICT: 'Outra tela está usando o microfone. Volte ao início e tente novamente.',
};

/** Sem eventos por este tempo a leitura é tratada como indisponível, nunca como nota atual. */
export const STALE_AFTER_MS = 1200;
/** Leituras consecutivas usadas na mediana exibida (≈ 0,5 s a 10 eventos/s). */
export const SMOOTHING_FRAMES = 5;

const median = (values: number[]) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? null;
};

export function useTuner() {
  const [status, setStatus] = useState<TunerStatus>('idle');
  const [error, setError] = useState('');
  const [moduleUnavailable, setModuleUnavailable] = useState(false);
  const [pitch, setPitch] = useState<PitchEvent | null>(null);
  const [session, setSession] = useState<TunerSession | null>(null);
  const [recent, setRecent] = useState<number[]>([]);
  const mounted = useRef(true);
  const operation = useRef(0);
  const startPending = useRef(false);
  const awaitingPermission = useRef(false);
  const filter = useRef(createSessionFilter());
  const staleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const busy = status === 'starting' || status === 'requestingPermission' || status === 'stopping';

  const clearStale = useCallback(() => {
    if (staleTimer.current) clearTimeout(staleTimer.current);
    staleTimer.current = undefined;
  }, []);

  const stop = useCallback(async () => {
    operation.current++;
    filter.current.end();
    clearStale();
    setStatus('stopping');
    try {
      await nativeTuner.stop();
      if (mounted.current) {
        setPitch(null);
        setSession(null);
        setError('');
        setStatus('idle');
      }
    } catch {
      if (mounted.current) {
        setStatus('error');
        setError('Não foi possível encerrar o afinador. Feche e abra o aplicativo.');
      }
    }
  }, [clearStale]);

  useEffect(() => {
    mounted.current = true;
    const sessionFilter = filter.current;
    let pitchSubscription: { remove: () => void } | undefined;
    let errorSubscription: { remove: () => void } | undefined;
    try {
      if (Platform.OS !== 'android') throw new Error('PLATFORM_UNSUPPORTED');
      pitchSubscription = nativeTuner.onPitch((event) => {
        if (!mounted.current || !sessionFilter.accept(event)) return;
        setPitch(event);
        setRecent((previous) => event.state === 'reading' && event.frequencyHz !== null
          ? [...previous.slice(-(SMOOTHING_FRAMES - 1)), event.frequencyHz]
          : []);
        clearStale();
        staleTimer.current = setTimeout(() => {
          if (mounted.current) {
            setPitch(null);
            setRecent([]);
          }
        }, STALE_AFTER_MS);
      });
      errorSubscription = nativeTuner.onError(({ code }) => {
        operation.current++;
        sessionFilter.end();
        clearStale();
        if (mounted.current) {
          setError(errorLabels[code] ?? 'Ocorreu um erro ao capturar áudio.');
          setStatus('error');
          setPitch(null);
          setRecent([]);
          setSession(null);
        }
      });
    } catch {
      void Promise.resolve().then(() => {
        if (mounted.current) {
          setModuleUnavailable(true);
          setError(Platform.OS === 'android'
            ? 'O módulo nativo exige o aplicativo Android compilado, não o Expo Go.'
            : 'O afinador está disponível apenas no Android.');
          setStatus('error');
        }
      });
    }
    const appState = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && !awaitingPermission.current) {
        operation.current++;
        sessionFilter.end();
        clearStale();
        void nativeTuner.stop().catch(() => {});
        if (mounted.current) {
          setStatus('idle');
          setPitch(null);
          setRecent([]);
          setSession(null);
        }
      }
    });
    return () => {
      mounted.current = false;
      startPending.current = false;
      sessionFilter.end();
      clearStale();
      pitchSubscription?.remove();
      errorSubscription?.remove();
      appState.remove();
      void nativeTuner.stop().catch(() => {});
    };
  }, [clearStale]);

  const start = useCallback(async () => {
    if (moduleUnavailable || busy || status === 'listening' || startPending.current) return;
    startPending.current = true;
    const id = ++operation.current;
    setError('');
    setPitch(null);
    setRecent([]);
    if (Platform.OS !== 'android') {
      startPending.current = false;
      setStatus('error');
      setError('O afinador está disponível apenas no Android.');
      return;
    }
    try {
      setStatus('requestingPermission');
      awaitingPermission.current = true;
      let granted: string;
      try {
        granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      } finally {
        awaitingPermission.current = false;
      }
      if (!mounted.current || id !== operation.current || AppState.currentState === 'background') return;
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setStatus('error');
        setError(granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
          ? 'O microfone está bloqueado para o Riffando. Ative-o em Configurações > Apps > Riffando > Permissões > Microfone e tente de novo.'
          : 'O microfone precisa de autorização para o afinador funcionar.');
        return;
      }
      setStatus('starting');
      const started = await nativeTuner.start();
      if (!mounted.current || id !== operation.current) {
        await nativeTuner.stop();
        return;
      }
      filter.current.begin(started.sessionId);
      setSession(started);
      setStatus('listening');
    } catch (failure) {
      if (!mounted.current || id !== operation.current) return;
      const message = failure instanceof Error ? failure.message : '';
      const code = Object.keys(errorLabels).find((key) => message.includes(key));
      setStatus('error');
      setError(code ? errorLabels[code] ?? '' : 'Não foi possível iniciar o afinador. Tente novamente.');
    } finally {
      startPending.current = false;
    }
  }, [busy, moduleUnavailable, status]);

  const smoothedHz = median(recent);
  return { status, busy, error, moduleUnavailable, pitch, smoothedHz, session, start, stop };
}

/** Valor atualizado no máximo uma vez por intervalo; evita anúncios frequentes aos leitores de tela. */
export function useThrottledValue<T>(value: T, intervalMs: number): T {
  const [shown, setShown] = useState(value);
  const last = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    const wait = last.current + intervalMs - Date.now();
    if (timer.current) clearTimeout(timer.current);
    if (wait <= 0) {
      last.current = Date.now();
      setShown(value);
    } else {
      timer.current = setTimeout(() => {
        last.current = Date.now();
        setShown(value);
      }, wait);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, intervalMs]);
  return shown;
}
