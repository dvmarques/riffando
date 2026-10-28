import { renderRouter, screen } from 'expo-router/testing-library';
import { userEvent, waitFor } from '@testing-library/react-native';
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

beforeEach(() => jest.clearAllMocks());
afterEach(() => jest.restoreAllMocks());

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
