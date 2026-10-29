import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { messages } from '@/shared/i18n/pt-BR';
import { Action } from '@/shared/ui/Action';
import { Screen } from '@/shared/ui/Screen';
import { styles } from './styles';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <Screen>
      <Text style={styles.brand}>{messages.name}</Text>
      <Text style={styles.body}>{messages.tagline}</Text>
      <Text style={styles.eyebrow}>{messages.stage}</Text>
      <Text accessibilityRole="header" style={styles.title}>{messages.welcome}</Text>
      <Text style={styles.body}>{messages.introduction}</Text>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.heading}>{messages.unavailableTitle}</Text>
        <Text style={styles.body}>{messages.unavailable}</Text>
      </View>
      <Action label={messages.audioAction} onPress={() => router.push('/diagnostico-audio')} />
      <Action label={messages.aboutAction} onPress={() => router.push('/informacoes')} />
    </Screen>
  );
}
