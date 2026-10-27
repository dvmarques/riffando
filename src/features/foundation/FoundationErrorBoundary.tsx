import type { ErrorBoundaryProps } from 'expo-router';
import { Text } from 'react-native';
import { messages } from '@/shared/i18n/pt-BR';
import { Action } from '@/shared/ui/Action';
import { Screen } from '@/shared/ui/Screen';
import { styles } from './styles';

export function FoundationErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <Screen>
      <Text accessibilityRole="header" style={styles.title}>{messages.errorTitle}</Text>
      <Text accessibilityRole="alert" style={styles.body}>{messages.errorDescription}</Text>
      <Action label={messages.retry} onPress={() => { void retry(); }} />
    </Screen>
  );
}
