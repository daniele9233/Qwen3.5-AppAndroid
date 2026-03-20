import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api, RunDetail as RunDetailType } from '@/src/api';

export default function RunDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [run, setRun] = useState<RunDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadRun();
  }, [id]);

  const loadRun = async () => {
    try {
      const data = await api.getRun(id!);
      setRun(data);
    } catch (error) {
      console.error('Error loading run:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeRun = async () => {
    if (!run) return;
    setAnalyzing(true);
    try {
      await api.analyzeRun(run.id, {
        distance: run.distance,
        duration: run.duration,
        pace: run.pace,
        avg_hr: run.avg_heart_rate,
        session_type: run.type,
      });
      await loadRun(); // Reload with analysis
    } catch (error) {
      console.error('Error analyzing run:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Caricamento...</Text>
      </View>
    );
  }

  if (!run) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
        <Text style={styles.errorText}>Corsa non trovata</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Torna indietro</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sessionType = theme.sessionTypes[run.type as keyof typeof theme.sessionTypes] || theme.sessionTypes.corsaLenta;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeEmoji}>{sessionType.icon}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.date}>{new Date(run.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          <Text style={styles.typeLabel}>{sessionType.label}</Text>
        </View>
      </View>

      {/* Main Metrics */}
      <View style={styles.metricsCard}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{run.distance}</Text>
          <Text style={styles.metricLabel}>km</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{run.pace}</Text>
          <Text style={styles.metricLabel}>/km</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{Math.floor(run.duration / 60)}'</Text>
          <Text style={styles.metricLabel}>durata</Text>
        </View>
      </View>

      {/* Secondary Metrics */}
      {(run.avg_heart_rate || run.max_heart_rate) && (
        <View style={styles.hrCard}>
          <View style={styles.hrRow}>
            <View style={styles.hrItem}>
              <Ionicons name="heart" size={20} color={theme.colors.error} />
              <Text style={styles.hrLabel}>FC Media</Text>
              <Text style={styles.hrValue}>{run.avg_heart_rate} bpm</Text>
            </View>
            {run.max_heart_rate && (
              <View style={styles.hrItem}>
                <Ionicons name="pulse" size={20} color={theme.colors.accent} />
                <Text style={styles.hrLabel}>FC Max</Text>
                <Text style={styles.hrValue}>{run.max_heart_rate} bpm</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Location & Notes */}
      {run.location && (
        <View style={styles.infoCard}>
          <Ionicons name="location" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>{run.location}</Text>
        </View>
      )}

      {run.notes && (
        <View style={styles.notesCard}>
          <Text style={styles.notesLabel}>Note</Text>
          <Text style={styles.notesText}>{run.notes}</Text>
        </View>
      )}

      {/* Verdict */}
      {run.verdict && (
        <View style={[styles.verdictCard, {
          backgroundColor: run.verdict === 'perfetto' ? theme.colors.success :
                          run.verdict === 'ok' ? theme.colors.info :
                          run.verdict === 'troppo_lento' ? theme.colors.warning :
                          run.verdict === 'troppo_veloce' ? theme.colors.error :
                          theme.colors.surfaceElevated
        }]}>
          <Ionicons 
            name={run.verdict === 'perfetto' ? 'checkmark-circle' : 
                  run.verdict === 'ok' ? 'checkmark' : 
                  run.verdict === 'troppo_lento' ? 'time' :
                  run.verdict === 'troppo_veloce' ? 'speedometer' : 'fitness'} 
            size={24} 
            color={theme.colors.background} 
          />
          <Text style={styles.verdictText}>
            {run.verdict === 'perfetto' ? 'Perfetto! Sessione eseguita alla perfezione' :
             run.verdict === 'ok' ? 'Buon lavoro! Sessione nella norma' :
             run.verdict === 'troppo_lento' ? 'Sessione troppo lenta rispetto al piano' :
             run.verdict === 'troppo_veloce' ? 'Sessione troppo veloce rispetto al piano' :
             'Corsa extra fuori dal piano'}
          </Text>
        </View>
      )}

      {/* AI Analysis */}
      {run.analysis ? (
        <View style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <Ionicons name="sparkles" size={24} color={theme.colors.accent} />
            <Text style={styles.analysisTitle}>Analisi AI</Text>
            <View style={styles.analysisBadge}>
              <Text style={styles.analysisBadgeText}>
                {run.analysis.model === 'gemini-1.5-flash' ? '🤖 Gemini' : '📊 Algoritmica'}
              </Text>
            </View>
          </View>

          <View style={styles.analysisContent}>
            <Text style={styles.analysisIntro}>{run.analysis.sections.intro}</Text>
            
            <View style={styles.analysisSection}>
              <Text style={styles.analysisSectionTitle}>✅ Punti di forza</Text>
              {run.analysis.sections.positivi.map((p, i) => (
                <Text key={i} style={styles.analysisBullet}>• {p}</Text>
              ))}
            </View>

            <View style={styles.analysisSection}>
              <Text style={styles.analysisSectionTitle}>📈 Da migliorare</Text>
              {run.analysis.sections.lacune.map((p, i) => (
                <Text key={i} style={styles.analysisBullet}>• {p}</Text>
              ))}
            </View>

            <View style={styles.analysisSection}>
              <Text style={styles.analysisSectionTitle}>💡 Consigli tecnici</Text>
              {run.analysis.sections.consigliTecnici.map((p, i) => (
                <Text key={i} style={styles.analysisBullet}>• {p}</Text>
              ))}
            </View>

            <View style={styles.voteContainer}>
              <Text style={styles.voteLabel}>Voto allenatore</Text>
              <View style={styles.voteBadge}>
                <Text style={styles.voteValue}>{run.analysis.sections.voto}/10</Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.analyzeButton} onPress={analyzeRun} disabled={analyzing}>
          {analyzing ? (
            <ActivityIndicator color={theme.colors.background} />
          ) : (
            <>
              <Ionicons name="sparkles" size={24} color={theme.colors.background} />
              <Text style={styles.analyzeButtonText}>Analizza con AI</Text>
            </>
          )}
        </TouchableOpacity>
      )}
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
  loadingText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.lg,
  },
  backButton: {
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
  },
  backButtonText: {
    color: theme.colors.background,
    fontWeight: theme.fontWeight.semibold,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  typeBadge: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  typeEmoji: {
    fontSize: theme.fontSize.xxl,
  },
  headerInfo: {
    flex: 1,
  },
  date: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    textTransform: 'capitalize',
  },
  typeLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  metricsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
  },
  metricLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  hrCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  hrRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  hrItem: {
    alignItems: 'center',
    flex: 1,
  },
  hrLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  hrValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    marginLeft: theme.spacing.sm,
  },
  notesCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  notesLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.sm,
  },
  notesText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    lineHeight: 20,
  },
  verdictCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  verdictText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    flex: 1,
  },
  analysisCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  analysisTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  analysisBadge: {
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  analysisBadgeText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
  },
  analysisContent: {
    gap: theme.spacing.md,
  },
  analysisIntro: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    lineHeight: 20,
  },
  analysisSection: {
    marginTop: theme.spacing.sm,
  },
  analysisSectionTitle: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.sm,
  },
  analysisBullet: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    lineHeight: 20,
    marginLeft: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  voteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  voteLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  voteBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  voteValue: {
    color: theme.colors.background,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  analyzeButton: {
    backgroundColor: theme.colors.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  analyzeButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
});
