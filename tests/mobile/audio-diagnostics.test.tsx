import { renderRouter, screen } from 'expo-router/testing-library';
import { act, userEvent, waitFor } from '@testing-library/react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import Layout from '../../app/_layout';
import Home from '../../app/index';
import Audio from '../../app/diagnostico-audio';
import { messages } from '@/shared/i18n/pt-BR';
import { nativeCapture } from '@/infrastructure/audio/nativeCapture';

jest.mock('@/infrastructure/audio/nativeCapture', () => ({
  nativeCapture: {
    onMetrics: jest.fn(() => ({ remove: jest.fn() })),
    onError: jest.fn(() => ({ remove: jest.fn() })),
    start: jest.fn(async () => ({
      sampleRate: 48000, channels: 1, encoding: 'pcm16',
      bufferBytes: 9600, source: 'mic',
    })),
    stop: jest.fn(async () => {}),
  },
}));

const originalPlatform = Platform.OS;
beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
});
afterEach(() => {
  jest.restoreAllMocks();
  Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
});

it('navega ao diagnóstico sem solicitar microfone na inicialização', async () => {
  const request = jest.spyOn(PermissionsAndroid, 'request');
  await renderRouter({ _layout: Layout, index: Home, 'diagnostico-audio': Audio });
  await userEvent.setup().press(screen.getByRole('button', { name: messages.audioAction }));
  expect(screen).toHavePathname('/diagnostico-audio');
  expect(screen.getByText('Captura parada')).toBeVisible();
  expect(screen.getByText(/Não é um afinador/)).toBeVisible();
  expect(nativeCapture.start).not.toHaveBeenCalled();
  expect(request).not.toHaveBeenCalled();
});

it('nega permissão sem iniciar microfone', async () => {
  const originalOS = Platform.OS;
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
  const request = jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);
  try {
    await renderRouter({ _layout: Layout, index: Home, 'diagnostico-audio': Audio }, { initialUrl: '/diagnostico-audio' });
    await userEvent.setup().press(screen.getByRole('button', { name: 'Iniciar captura' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/O microfone precisa de autorização/));
    expect(request).toHaveBeenCalledWith(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    expect(nativeCapture.start).not.toHaveBeenCalled();
  } finally {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  }
});

it('inicia somente após permissão concedida e permite parar', async () => {
  const originalOS = Platform.OS;
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
  const request = jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);
  try {
    await renderRouter({ _layout: Layout, index: Home, 'diagnostico-audio': Audio }, { initialUrl: '/diagnostico-audio' });
    expect(nativeCapture.start).not.toHaveBeenCalled();
    await userEvent.setup().press(screen.getByRole('button', { name: 'Iniciar captura' }));
    await waitFor(() => expect(screen.getByText('Captura ativa')).toBeVisible());
    expect(request).toHaveBeenCalledTimes(1);
    expect(nativeCapture.start).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Frequência: 48000 Hz')).toBeVisible();
    await userEvent.setup().press(screen.getByRole('button', { name: 'Parar captura' }));
    await waitFor(() => expect(screen.getByText('Captura parada')).toBeVisible());
    expect(nativeCapture.stop).toHaveBeenCalled();
  } finally {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  }
});

it('não solicita microfone quando módulo nativo não está instalado', async () => {
  const originalOS = Platform.OS;
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
  jest.mocked(nativeCapture.onMetrics).mockImplementationOnce(() => { throw new Error('missing native'); });
  const permission = jest.spyOn(PermissionsAndroid, 'request');
  try {
    await renderRouter({ _layout: Layout, index: Home, 'diagnostico-audio': Audio }, { initialUrl: '/diagnostico-audio' });
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/módulo nativo exige/));
    expect(screen.queryByRole('button', { name: 'Iniciar captura' })).toBeNull();
    expect(permission).not.toHaveBeenCalled();
  } finally {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  }
});

it('mostra erro nativo sem inventar uma medição', async () => {
  await renderRouter({ _layout: Layout, index: Home, 'diagnostico-audio': Audio }, { initialUrl: '/diagnostico-audio' });
  const listener = jest.mocked(nativeCapture.onError).mock.calls[0]?.[0];
  expect(listener).toBeDefined();
  await act(async () => { listener?.({ code: 'AUDIO_READ_FAILED' }); });
  expect(screen.getByRole('alert')).toHaveTextContent('A leitura do microfone foi interrompida.');
  expect(screen.getByText('Captura indisponível')).toBeVisible();
  expect(screen.getByText('RMS: — dBFS')).toBeVisible();
});
