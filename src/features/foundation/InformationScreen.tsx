import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { messages } from '@/shared/i18n/pt-BR';
import { Action } from '@/shared/ui/Action';
import { Screen } from '@/shared/ui/Screen';
import { styles } from './styles';

export default function InformationScreen() {
  const router = useRouter();
  return (
    <Screen>
      <Text accessibilityRole="header" style={styles.title}>{messages.aboutTitle}</Text>
      <Text style={styles.body}>{messages.aboutDescription}</Text>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.heading}>{messages.privacyTitle}</Text>
        <Text style={styles.body}>{messages.privacy}</Text>
      </View>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.heading}>{messages.offlineTitle}</Text>
        <Text style={styles.body}>{messages.offline}</Text>
      </View>
      <Action label={messages.back} onPress={() => router.canGoBack() ? router.back() : router.replace('/')} />
    </Screen>
  );
}
