import { requireNativeModule, type EventSubscription } from 'expo';

export type CaptureStatus = 'idle' | 'requestingPermission' | 'starting' | 'recording' | 'stopping' | 'error';

export type CaptureConfig = {
  sampleRate: number;
  channels: 1;
  encoding: 'pcm16';
  bufferBytes: number;
  source: 'mic' | 'unprocessed';
};

export type CaptureMetrics = {
  rmsDbfs: number;
  peakDbfs: number;
  clipping: boolean;
  framesRead: number;
  timestampOrigin: 'audio-record' | 'unavailable';
  timestampNanos: string;
  timestampFrame: number;
  observedAtNanos: string;
};

export type CaptureError = { code: string };

type AudioNativeModule = {
  startCapture(): Promise<CaptureConfig>;
  stopCapture(): Promise<void>;
  getCaptureStatus(): Promise<{ state: CaptureStatus }>;
  addListener(event: 'onMetrics', listener: (metrics: CaptureMetrics) => void): EventSubscription;
  addListener(event: 'onCaptureError', listener: (error: CaptureError) => void): EventSubscription;
};

let instance: AudioNativeModule | undefined;
function getNative(): AudioNativeModule {
  // Resolvido somente ao abrir o diagnóstico: Expo Go não contém o módulo.
  instance ??= requireNativeModule<AudioNativeModule>('RiffandoAudio');
  return instance;
}

export const nativeCapture = {
  // async: módulo ausente (Expo Go) vira rejeição, nunca exceção síncrona em cleanup/AppState.
  start: async () => getNative().startCapture(),
  stop: async () => getNative().stopCapture(),
  status: async () => getNative().getCaptureStatus(),
  onMetrics: (listener: (value: CaptureMetrics) => void) => getNative().addListener('onMetrics', listener),
  onError: (listener: (value: CaptureError) => void) => getNative().addListener('onCaptureError', listener),
};
