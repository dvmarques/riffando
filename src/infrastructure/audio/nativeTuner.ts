import { requireNativeModule, type EventSubscription } from 'expo';
import type { CaptureConfig, CaptureError } from './nativeCapture';

/** Estados nativos; frequência só existe em `reading` (nunca valor fictício). */
export type PitchState = 'reading' | 'no-signal' | 'unstable' | 'unreliable';

export type PitchEvent = {
  sessionId: number;
  sequence: number;
  state: PitchState;
  frequencyHz: number | null;
  confidence: number;
  rmsDbfs: number;
  /** true: frequência da fundamental medida; false: do período (pode ter viés de inarmonicidade). */
  refined: boolean;
  windowMs: number;
  sampleRateHz: number;
  observedAtNanos: string;
  /** Custo médio por quadro de análise no aparelho (µs); medida de CPU, não de latência. */
  analysisMicros: number;
};

export type TunerSession = CaptureConfig & { sessionId: number };

type TunerNativeModule = {
  startTuner(): Promise<TunerSession>;
  stopCapture(): Promise<void>;
  addListener(event: 'onPitch', listener: (event: PitchEvent) => void): EventSubscription;
  addListener(event: 'onCaptureError', listener: (error: CaptureError) => void): EventSubscription;
};

let instance: TunerNativeModule | undefined;
const getNative = () => (instance ??= requireNativeModule<TunerNativeModule>('RiffandoAudio'));

export const nativeTuner = {
  // async: módulo ausente (Expo Go) vira rejeição, nunca exceção síncrona em cleanup/AppState.
  start: async () => getNative().startTuner(),
  stop: async () => getNative().stopCapture(),
  onPitch: (listener: (event: PitchEvent) => void) => getNative().addListener('onPitch', listener),
  onError: (listener: (error: CaptureError) => void) => getNative().addListener('onCaptureError', listener),
};
