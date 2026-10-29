import { nativeCapture } from '@/infrastructure/audio/nativeCapture';

jest.mock('expo', () => ({
  requireNativeModule: jest.fn(() => { throw new Error('Cannot find native module RiffandoAudio'); }),
}));

it('módulo nativo ausente rejeita as chamadas em vez de lançar de forma síncrona', async () => {
  let pending: Promise<unknown> | undefined;
  expect(() => { pending = nativeCapture.stop(); }).not.toThrow();
  await expect(pending).rejects.toThrow(/native module/);
  expect(() => nativeCapture.start().catch(() => {})).not.toThrow();
  expect(() => nativeCapture.status().catch(() => {})).not.toThrow();
});
