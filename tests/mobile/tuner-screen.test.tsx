import { renderRouter, screen } from 'expo-router/testing-library';
import { act, userEvent, waitFor } from '@testing-library/react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import Layout from '../../app/_layout';
import Home from '../../app/index';
import Tuner from '../../app/afinador';
import { messages, tunerMessages as t } from '@/shared/i18n/pt-BR';
import { nativeTuner, type PitchEvent } from '@/infrastructure/audio/nativeTuner';

let pitchListener: ((event: PitchEvent) => void) | undefined;
let errorListener: ((error: { code: string }) => void) | undefined;

jest.mock('@/infrastructure/audio/nativeTuner', () => ({
  nativeTuner: { onPitch: jest.fn(), onError: jest.fn(), start: jest.fn(), stop: jest.fn() },
}));

const originalPlatform = Platform.OS;
const routes = { _layout: Layout, index: Home, afinador: Tuner };
const event = (over: Partial<PitchEvent> & Pick<PitchEvent, 'sequence' | 'state'>): PitchEvent => ({
  sessionId: 7, frequencyHz: null, confidence: 0.99, rmsDbfs: -20, windowMs: 64, sampleRateHz: 48000, observedAtNanos: '1', analysisMicros: 900, ...over,
});

let seq = 0;
async function startTuner(fakeTimers = false) {
  if (fakeTimers) jest.useFakeTimers();
  jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);
  await renderRouter(routes, { initialUrl: '/afinador' });
  const user = userEvent.setup(fakeTimers ? { advanceTimers: jest.advanceTimersByTime } : undefined);
  await user.press(screen.getByRole('button', { name: t.start }));
  await waitFor(() => expect(screen.getByRole('button', { name: t.stop })).toBeVisible());
}
const emit = (value: PitchEvent) => act(async () => { pitchListener?.(value); });
/** Cinco leituras iguais (mediana de ≈ 0,5 s) e tempo para o número de cents atualizar (fake timers). */
async function settle(frequencyHz: number) {
  for (let i = 0; i < 5; i++) await emit(event({ sequence: ++seq, state: 'reading', frequencyHz }));
  await act(async () => { jest.advanceTimersByTime(450); });
}

beforeEach(() => {
  jest.clearAllMocks();
  seq = 0;
  pitchListener = undefined;
  errorListener = undefined;
  jest.mocked(nativeTuner.onPitch).mockImplementation((listener) => { pitchListener = listener; return { remove: jest.fn() }; });
  jest.mocked(nativeTuner.onError).mockImplementation((listener) => { errorListener = listener; return { remove: jest.fn() }; });
  jest.mocked(nativeTuner.start).mockResolvedValue({ sampleRate: 48000, channels: 1, encoding: 'pcm16', bufferBytes: 19200, source: 'mic', sessionId: 7 });
  jest.mocked(nativeTuner.stop).mockResolvedValue(undefined);
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
  Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
});

it('abre pela tela inicial sem pedir microfone nem iniciar captura', async () => {
  const request = jest.spyOn(PermissionsAndroid, 'request');
  await renderRouter(routes);
  await userEvent.setup().press(screen.getByRole('button', { name: messages.tunerAction }));
  expect(screen).toHavePathname('/afinador');
  expect(screen.getByText(t.idle)).toBeVisible();
  expect(request).not.toHaveBeenCalled();
  expect(nativeTuner.start).not.toHaveBeenCalled();
});

it('não inicia o afinador quando a permissão é negada', async () => {
  jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);
  await renderRouter(routes, { initialUrl: '/afinador' });
  await userEvent.setup().press(screen.getByRole('button', { name: t.start }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/precisa de autorização/));
  expect(nativeTuner.start).not.toHaveBeenCalled();
});

it('exibe nota grande, cents e estado em texto para uma leitura estável', async () => {
  await startTuner(true);
  await settle(110 * 2 ** (12 / 1200));
  expect(screen.getByText('Lá2')).toBeVisible();
  expect(screen.getByText('A2')).toBeVisible();
  expect(screen.getByText('+12 cents')).toBeVisible();
  expect(screen.getByText(t.sharp)).toBeVisible();
  await settle(110 * 2 ** (-2 / 1200));
  expect(screen.getByText('−2 cents')).toBeVisible();
  expect(screen.getByText(t.inTune)).toBeVisible();
  await settle(110 * 2 ** (-20 / 1200));
  expect(screen.getByText('−20 cents')).toBeVisible();
  expect(screen.getByText(t.flat)).toBeVisible();
});

it('suaviza a variação rápida: um valor isolado não muda o número exibido', async () => {
  await startTuner(true);
  await settle(110);
  expect(screen.getByText('0 cents')).toBeVisible();
  await emit(event({ sequence: ++seq, state: 'reading', frequencyHz: 110 * 2 ** (30 / 1200) }));
  await act(async () => { jest.advanceTimersByTime(450); });
  expect(screen.getByText('0 cents')).toBeVisible();
});

it('não mostra nota nem ponteiro sem sinal, instável ou não confiável', async () => {
  await startTuner();
  await emit(event({ sequence: 1, state: 'reading', frequencyHz: 440 }));
  expect(screen.getByText('Lá4')).toBeVisible();
  for (const [sequence, state, text] of [[2, 'unreliable', t.unreliable], [3, 'no-signal', t.noSignal], [4, 'unstable', t.unstable]] as const) {
    await emit(event({ sequence, state }));
    expect(screen.queryByText('Lá4')).toBeNull();
    expect(screen.getByText('— cents')).toBeVisible();
    expect(screen.getByText(text)).toBeVisible();
  }
});

it('trata nota não identificada em nível muito baixo como sem sinal, sem alternar mensagens', async () => {
  await startTuner();
  await emit(event({ sequence: 1, state: 'unreliable', rmsDbfs: -48 }));
  expect(screen.getByText(t.noSignal)).toBeVisible();
  await emit(event({ sequence: 2, state: 'no-signal', rmsDbfs: -52 }));
  expect(screen.getByText(t.noSignal)).toBeVisible();
  await emit(event({ sequence: 3, state: 'unreliable', rmsDbfs: -25 }));
  expect(screen.getByText(t.unreliable)).toBeVisible();
});

it('ignora eventos de outra sessão e eventos repetidos ou atrasados', async () => {
  await startTuner();
  await emit(event({ sequence: 5, state: 'reading', frequencyHz: 440 }));
  await emit(event({ sequence: 6, sessionId: 6, state: 'reading', frequencyHz: 110 }));
  await emit(event({ sequence: 4, state: 'reading', frequencyHz: 110 }));
  await emit(event({ sequence: 5, state: 'reading', frequencyHz: 110 }));
  expect(screen.getByText('Lá4')).toBeVisible();
  expect(screen.queryByText('Lá2')).toBeNull();
});

it('modo guitarra: mede o desvio da corda-alvo e não declara afinada outra nota ou oitava', async () => {
  await startTuner(true);
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  await user.press(screen.getByRole('radio', { name: t.modeGuitar }));
  await user.press(screen.getByRole('radio', { name: 'Corda 5, Lá2 (A2)' }));
  await settle(110 * 2 ** (-30 / 1200));
  expect(screen.getByText('−30 cents')).toBeVisible();
  expect(screen.getByText(t.flat)).toBeVisible();
  await settle(220);
  expect(screen.getByText(t.octaveAbove)).toBeVisible();
  expect(screen.queryByText(t.inTune)).toBeNull();
  expect(screen.getByText('— cents')).toBeVisible();
  await settle(82.4069);
  expect(screen.getByText(t.otherNote)).toBeVisible();
  expect(screen.queryByText(t.inTune)).toBeNull();
});

it('trata a leitura como indisponível quando os eventos param de chegar', async () => {
  jest.useFakeTimers();
  jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);
  await renderRouter(routes, { initialUrl: '/afinador' });
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  await user.press(screen.getByRole('button', { name: t.start }));
  await waitFor(() => expect(screen.getByRole('button', { name: t.stop })).toBeVisible());
  await emit(event({ sequence: 1, state: 'reading', frequencyHz: 440 }));
  expect(screen.getByText('Lá4')).toBeVisible();
  await act(async () => { jest.advanceTimersByTime(1300); });
  expect(screen.queryByText('Lá4')).toBeNull();
});

it('exibe erro nativo sem manter leitura antiga e para ao tocar em parar', async () => {
  await startTuner();
  await emit(event({ sequence: 1, state: 'reading', frequencyHz: 440 }));
  await act(async () => { errorListener?.({ code: 'AUDIO_PERMISSION_REVOKED' }); });
  expect(screen.getByRole('alert')).toHaveTextContent(/revogado/);
  expect(screen.queryByText('Lá4')).toBeNull();
  expect(screen.getByRole('button', { name: t.start })).toBeVisible();
});

it('para o microfone ao tocar em parar', async () => {
  await startTuner();
  await userEvent.setup().press(screen.getByRole('button', { name: t.stop }));
  await waitFor(() => expect(nativeTuner.stop).toHaveBeenCalled());
  await waitFor(() => expect(screen.getByRole('button', { name: t.start })).toBeVisible());
});
