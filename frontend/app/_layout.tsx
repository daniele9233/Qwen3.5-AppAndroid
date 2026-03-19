import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from '@/src/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={theme.colors.background} />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.text,
            headerTitleStyle: {
              fontWeight: theme.fontWeight.semibold,
            },
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="add-run" options={{ presentation: 'modal', title: 'Nuova Corsa' }} />
          <Stack.Screen name="add-test" options={{ presentation: 'modal', title: 'Nuovo Test' }} />
          <Stack.Screen name="run-detail" options={{ title: 'Dettaglio Corsa' }} />
          <Stack.Screen name="workout-detail" options={{ title: 'Dettaglio Sessione' }} />
          <Stack.Screen name="periodizzazione" options={{ title: 'Periodizzazione' }} />
          <Stack.Screen name="progressi" options={{ title: 'Progressi' }} />
          <Stack.Screen name="calcolatore" options={{ title: 'Calcolatore' }} />
          <Stack.Screen name="injury-risk" options={{ title: 'Injury Risk' }} />
          <Stack.Screen name="strava-callback" options={{ headerShown: false }} />
          <Stack.Screen name="badges" options={{ title: 'Badge e Trofei' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
