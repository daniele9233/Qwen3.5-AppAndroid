import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api, AnalyticsData, VdotPaces } from '@/src/api';

export default function Progressi() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [vdotPaces, setVdotPaces] = useState<VdotPaces | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [analyticsData, pacesData] = await Promise.all([
        api.getAnalytics(),
        api.getVdotPaces(),
      ]);
      setAnalytics(analyticsData);
      setVdotPaces(pacesData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics || !vdotPaces) {
    return (
      <View style={styles.centered}>
        <Ionicons name="loader" size={32} color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* VO2Max Card */}
      <View style={styles.vo2Card}>
        <View style={styles.vo2Header}>
          <Ionicons name="fitness" size={24} color={theme.colors.accent} />
          <Text style={styles.vo2Title}>VO2max Corrente</Text>
        </View>
        <Text style={styles.vo2Value}>{analytics.vo2max.current}</Text>
        <Text style={styles.vo2Target}>Target: {analytics.vo2max.target}</Text>
        
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min((analytics.vo2max.current / analytics.vo2max.target) * 100, 100)}%` }
            ]} 
          />
        </View>
      </View>

      {/* Race Predictions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Previsioni Gara</Text>
        {Object.entries(analytics.racePredictions).map(([distance, prediction]) => (
          <View key={distance} style={styles.predictionRow}>
            <Text style={styles.predictionDistance}>
              {distance === '21.1' ? '🏆 Mezza' : distance === '42.2' ? 'Maratona' : `${distance} km`}
            </Text>
            <View style={styles.predictionMetrics}>
              <Text style={styles.predictionTime}>{prediction.time}</Text>
              <Text style={styles.predictionPace}>{prediction.pace}/km</Text>
            </View>
          </View>
        ))}
      </View>

      {/* VDOT Paces */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Passi di Allenamento (VDOT)</Text>
        <View style={styles.pacesList}>
          <View style={styles.paceRow}>
            <Text style={styles.paceLabel}>🟢 Easy</Text>
            <Text style={styles.paceValue}>{vdotPaces.easy}/km</Text>
          </View>
          <View style={styles.paceRow}>
            <Text style={styles.paceLabel}>🔵 Marathon</Text>
            <Text style={styles.paceValue}>{vdotPaces.marathon}/km</Text>
          </View>
          <View style={styles.paceRow}>
            <Text style={styles.paceLabel}>🟡 Threshold</Text>
            <Text style={styles.paceValue}>{vdotPaces.threshold}/km</Text>
          </View>
          <View style={styles.paceRow}>
            <Text style={styles.paceLabel}>🔴 Interval</Text>
            <Text style={styles.paceValue}>{vdotPaces.interval}/km</Text>
          </View>
          <View style={styles.paceRow}>
            <Text style={styles.paceLabel}>⚪ Repetition</Text>
            <Text style={styles.paceValue}>{vdotPaces.repetition}/km</Text>
          </View>
        </View>
      </View>

      {/* Anaerobic Threshold */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Soglia Anaerobica</Text>
        <Text style={styles.thresholdValue}>{analytics.anaerobicThreshold.current}/km</Text>
      </View>

      {/* Weekly Volume */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Volume Settimanale</Text>
        <View style={styles.volumeRow}>
          <View style={styles.volumeItem}>
            <View style={[styles.volumeBar, { backgroundColor: theme.colors.success, height: analytics.weeklyVolume.easy * 2 }]} />
            <Text style={styles.volumeLabel}>Easy</Text>
            <Text style={styles.volumeValue}>{analytics.weeklyVolume.easy}%</Text>
          </View>
          <View style={styles.volumeItem}>
            <View style={[styles.volumeBar, { backgroundColor: theme.colors.warning, height: analytics.weeklyVolume.moderate * 2 }]} />
            <Text style={styles.volumeLabel}>Moderato</Text>
            <Text style={styles.volumeValue}>{analytics.weeklyVolume.moderate}%</Text>
          </View>
          <View style={styles.volumeItem}>
            <View style={[styles.volumeBar, { backgroundColor: theme.colors.error, height: analytics.weeklyVolume.hard * 2 }]} />
            <Text style={styles.volumeLabel}>Intenso</Text>
            <Text style={styles.volumeValue}>{analytics.weeklyVolume.hard}%</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  vo2Card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  vo2Header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  vo2Title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  vo2Value: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
  },
  vo2Target: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.full,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.md,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  predictionDistance: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  predictionMetrics: {
    alignItems: 'flex-end',
  },
  predictionTime: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  predictionPace: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  pacesList: {
    gap: theme.spacing.sm,
  },
  paceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  paceLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  paceValue: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  thresholdValue: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
  },
  volumeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  volumeItem: {
    alignItems: 'center',
  },
  volumeBar: {
    width: 40,
    borderRadius: theme.borderRadius.sm,
  },
  volumeLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  volumeValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    marginTop: theme.spacing.xs,
  },
});
