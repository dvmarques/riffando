import { renderRouter, screen } from 'expo-router/testing-library';
import { userEvent } from '@testing-library/react-native';
import Layout from '../../app/_layout';
import Home from '../../app/index';
import Information from '../../app/informacoes';
import { messages } from '@/shared/i18n/pt-BR';

it('permite navegar e voltar com ações acessíveis sem fingir recursos musicais', async () => {
  await renderRouter({ _layout: Layout, index: Home, informacoes: Information });
  expect(screen.getByRole('header', { name: messages.welcome })).toBeVisible();
  expect(screen.getByText(messages.unavailable)).toBeVisible();
  expect(screen.queryByRole('progressbar')).toBeNull();
  const user = userEvent.setup();
  await user.press(screen.getByRole('button', { name: messages.aboutAction }));
  expect(screen).toHavePathname('/informacoes');
  expect(screen.getByText(messages.privacy)).toBeVisible();
  await user.press(screen.getByRole('button', { name: messages.back }));
  expect(screen).toHavePathname('/');
});

it('volta ao início ao abrir informações diretamente', async () => {
  await renderRouter({ _layout: Layout, index: Home, informacoes: Information }, { initialUrl: '/informacoes' });
  await userEvent.setup().press(screen.getByRole('button', { name: messages.back }));
  expect(screen).toHavePathname('/');
});
