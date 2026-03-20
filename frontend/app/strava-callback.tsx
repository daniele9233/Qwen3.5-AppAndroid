import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '@/src/theme';
import { api } from '@/src/api';

export default function StravaCallback() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const router = useRouter();

  useEffect(() => {
    if (code) {
      handleCallback(code);
    } else {
      // No code, redirect back
      setTimeout(() => router.replace('/profilo'), 2000);
    }
  }, [code]);

  const handleCallback = async (authCode: string) => {
    try {
      // Exchange code for token
      await api.post('/strava/exchange-code', { code: authCode });
      
      // Sync Strava activities
      await api.syncStrava();
      
      // Redirect back to profile after short delay
      setTimeout(() => router.replace('/profilo'), 2000);
    } catch (error) {
      console.error('Strava callback error:', error);
      setTimeout(() => router.replace('/profilo'), 3000);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.accent} />
      <Text style={styles.title}>Connessione a Strava...</Text>
      <Text style={styles.subtitle}>Sincronizzazione attività in corso</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    marginTop: theme.spacing.xl,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
