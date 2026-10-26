import { renderRouter, screen } from 'expo-router/testing-library';
import { userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { FoundationErrorBoundary } from '@/features/foundation/FoundationErrorBoundary';
import { messages } from '@/shared/i18n/pt-BR';

it('recupera uma falha de renderização sem expor detalhes técnicos', async () => {
  let failing = true;
  function Fault() { if (failing) throw new Error('detalhe privado'); return <Text>Recuperado</Text>; }
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    await renderRouter({ index: { default: Fault, ErrorBoundary: FoundationErrorBoundary } });
    expect(screen.getByRole('alert')).toHaveTextContent(messages.errorDescription);
    expect(screen.queryByText('detalhe privado')).toBeNull();
    failing = false;
    await userEvent.setup().press(screen.getByRole('button', { name: messages.retry }));
    expect(screen.getByText('Recuperado')).toBeVisible();
  } finally { log.mockRestore(); }
});
