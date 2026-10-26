import { StatusBar } from 'react-native';
import { Stack } from 'expo-router';
export { FoundationErrorBoundary as ErrorBoundary } from '@/features/foundation/FoundationErrorBoundary';

export default function RootLayout() {
  return <><StatusBar barStyle="light-content" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#101820' } }} /></>;
}
