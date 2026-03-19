import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api, AnalyticsData, VdotPaces } from '@/src/api';

export default function Statistiche() {
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <Ionicons name="loader" size={32} color={theme.colors.accent} />
        <Text style={styles.loadingText}>Caricamento statistiche...</Text>
      </View>
    );
  }

  if (!analytics || !vdotPaces) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Errore nel caricamento</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* VO2Max Gauge */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🫁 VO2Max (VDOT)</Text>
        <View style={styles.gaugeContainer}>
          <View style={styles.gauge}>
            <View style={[styles.gaugeFill, { width: `${Math.min(analytics.vo2max.current / analytics.vo2max.target * 100, 100)}%` }]} />
          </View>
          <View style={styles.gaugeValues}>
            <Text style={styles.gaugeCurrent}>{analytics.vo2max.current}</Text>
            <Text style={styles.gaugeTarget}>target: {analytics.vo2max.target}</Text>
          </View>
        </View>
        <Text style={styles.gaugeNote}>Valore VDOT calcolato con formule Jack Daniels</Text>
      </View>

      {/* Race Predictions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎯 Previsioni Gara (VDOT)</Text>
        {Object.entries(analytics.racePredictions).map(([distance, prediction]) => (
          <View key={distance} style={styles.predictionRow}>
            <Text style={styles.predictionDistance}>{distance} km</Text>
            <Text style={styles.predictionTime}>{prediction.time}</Text>
            <Text style={styles.predictionPace}>{prediction.pace}/km</Text>
            <Text style={[styles.predictionConf, { color: prediction.confidence > 0.8 ? theme.colors.success : theme.colors.warning }]}>
              {Math.round(prediction.confidence * 100)}%
            </Text>
          </View>
        ))}
      </View>

      {/* Training Paces */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⏱️ Zone di Allenamento</Text>
        <View style={styles.pacesGrid}>
          <PaceItem label="Easy" pace={vdotPaces.easy} color="#22c55e" desc="Fondo lento" />
          <PaceItem label="Marathon" pace={vdotPaces.marathon} color="#3b82f6" desc="Ritmo gara" />
          <PaceItem label="Threshold" pace={vdotPaces.threshold} color="#f59e0b" desc="Soglia" />
          <PaceItem label="Interval" pace={vdotPaces.interval} color="#ef4444" desc="Ripetute" />
          <PaceItem label="Repetition" pace={vdotPaces.repetition} color="#7c3aed" desc="Velocità" />
        </View>
      </View>

      {/* Anaerobic Threshold */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Soglia Anaerobica</Text>
        <View style={styles.thresholdRow}>
          <View style={styles.thresholdItem}>
            <Text style={styles.thresholdValue}>{analytics.anaerobicThreshold.current}</Text>
            <Text style={styles.thresholdLabel}>Passo attuale</Text>
          </View>
          <View style={styles.thresholdItem}>
            <Text style={styles.thresholdTarget}>4:20/km</Text>
            <Text style={styles.thresholdLabel}>Target obiettivo</Text>
          </View>
        </View>
      </View>

      {/* Weekly Volume */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Volume Settimanale</Text>
        <View style={styles.volumeBars}>
          <VolumeBar label="Easy" value={analytics.weeklyVolume.easy} color="#22c55e" />
          <VolumeBar label="Moderate" value={analytics.weeklyVolume.moderate} color="#f59e0b" />
          <VolumeBar label="Hard" value={analytics.weeklyVolume.hard} color="#ef4444" />
        </View>
        <Text style={styles.polarizationNote}>
          🎯 Target polarizzazione: 80% facile / 20% intenso (Seiler 2010)
        </Text>
      </View>

      {/* Best Efforts */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏆 Best Efforts</Text>
        {analytics.bestEfforts.length > 0 ? (
          analytics.bestEfforts.map((effort: any) => (
            <View key={effort.distance} style={styles.effortRow}>
              <Text style={styles.effortDistance}>{effort.distance} km</Text>
              <Text style={styles.effortTime}>{effort.time}</Text>
              <Text style={styles.effortPace}>{effort.pace}/km</Text>
              <Ionicons name="trophy" size={16} color={theme.colors.accent} />
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Completa corse per vedere i tuoi record! 🏃</Text>
        )}
      </View>

      {/* Injury Risk Link */}
      <TouchableOpacity style={styles.riskCard} onPress={() => {/* Navigate to injury risk */}}>
        <View style={styles.riskHeader}>
          <Text style={styles.riskTitle}>🩺 Injury Risk Score</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </View>
        <Text style={styles.riskDesc}>Analisi predittiva rischio infortunio basata su carico di allenamento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const PaceItem = ({ label, pace, color, desc }: { label: string; pace: string; color: string; desc: string }) => (
  <View style={styles.paceItem}>
    <View style={[styles.paceDot, { backgroundColor: color }]} />
    <Text style={styles.paceLabel}>{label}</Text>
    <Text style={styles.paceValue}>{pace}</Text>
    <Text style={styles.paceDesc}>{desc}</Text>
  </View>
);

const VolumeBar = ({ label, value, color }: { label: string; value: number; color: string }) => {
  const total = 100; // Assuming percentages
  return (
    <View style={styles.volumeItem}>
      <Text style={styles.volumeLabel}>{label}</Text>
      <View style={styles.volumeBarBg}>
        <View style={[styles.volumeBarFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.volumeValue}>{value}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  loadingText: { color: theme.colors.textSecondary, marginTop: theme.spacing.md },
  errorText: { color: theme.colors.error },
  
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border },
  cardTitle: { color: theme.colors.text, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold, marginBottom: theme.spacing.md },
  
  gaugeContainer: { alignItems: 'center', marginBottom: theme.spacing.sm },
  gauge: { width: '100%', height: 12, backgroundColor: theme.colors.border, borderRadius: 6, overflow: 'hidden', marginBottom: theme.spacing.sm },
  gaugeFill: { height: '100%', backgroundColor: theme.colors.accent, borderRadius: 6 },
  gaugeValues: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: theme.spacing.sm },
  gaugeCurrent: { color: theme.colors.accent, fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold },
  gaugeTarget: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md },
  gaugeNote: { color: theme.colors.textMuted, fontSize: theme.fontSize.xs, textAlign: 'center', fontStyle: 'italic' },
  
  predictionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  predictionDistance: { color: theme.colors.text, fontWeight: theme.fontWeight.medium },
  predictionTime: { color: theme.colors.accent, fontWeight: theme.fontWeight.semibold },
  predictionPace: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  predictionConf: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.medium },
  
  pacesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  paceItem: { width: '48%', backgroundColor: theme.colors.surfaceElevated, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, alignItems: 'center' },
  paceDot: { width: 10, height: 10, borderRadius: 5, marginBottom: theme.spacing.xs },
  paceLabel: { color: theme.colors.text, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.medium },
  paceValue: { color: theme.colors.accent, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold },
  paceDesc: { color: theme.colors.textSecondary, fontSize: theme.fontSize.xs, textAlign: 'center' },
  
  thresholdRow: { flexDirection: 'row', justifyContent: 'space-around' },
  thresholdItem: { alignItems: 'center' },
  thresholdValue: { color: theme.colors.text, fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold },
  thresholdTarget: { color: theme.colors.accent, fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold },
  thresholdLabel: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, marginTop: theme.spacing.xs },
  
  volumeBars: { gap: theme.spacing.md, marginBottom: theme.spacing.sm },
  volumeItem: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  volumeLabel: { color: theme.colors.text, fontSize: theme.fontSize.sm, width: 70 },
  volumeBarBg: { flex: 1, height: 8, backgroundColor: theme.colors.border, borderRadius: 4, overflow: 'hidden' },
  volumeBarFill: { height: '100%', borderRadius: 4 },
  volumeValue: { color: theme.colors.text, fontSize: theme.fontSize.sm, width: 40, textAlign: 'right' },
  polarizationNote: { color: theme.colors.textMuted, fontSize: theme.fontSize.xs, textAlign: 'center', fontStyle: 'italic', marginTop: theme.spacing.sm },
  
  effortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  effortDistance: { color: theme.colors.text, fontWeight: theme.fontWeight.medium },
  effortTime: { color: theme.colors.accent, fontWeight: theme.fontWeight.semibold },
  effortPace: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  
  emptyText: { color: theme.colors.textSecondary, textAlign: 'center', padding: theme.spacing.xl },
  
  riskCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border },
  riskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
  riskTitle: { color: theme.colors.text, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold },
  riskDesc: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
});
