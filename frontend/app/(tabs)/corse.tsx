import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api, Run } from '@/src/api';

export default function Corse() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    try {
      const data = await api.getRuns();
      setRuns(data);
    } catch (error) {
      console.error('Error loading runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: runs.length,
    km: runs.reduce((acc, r) => acc + (r.distance || 0), 0),
    avgPace: runs.length > 0 
      ? runs.reduce((acc, r) => acc + parseFloat(r.pace.split(':')[0]), 0) / runs.length 
      : 0,
  };

  const renderRun = ({ item }: { item: Run }) => (
    <TouchableOpacity 
      style={styles.runCard}
      onPress={() => router.push(`/run-detail?id=${item.id}`)}
    >
      <View style={styles.runHeader}>
        <Text style={styles.runDate}>{new Date(item.date).toLocaleDateString('it-IT')}</Text>
        <View style={[styles.typeBadge, { backgroundColor: theme.sessionTypes[item.type as keyof typeof theme.sessionTypes]?.color || theme.colors.info }]}>
          <Text style={styles.typeBadgeText}>{theme.sessionTypes[item.type as keyof typeof theme.sessionTypes]?.icon || '🏃'}</Text>
        </View>
      </View>
      
      {item.location && <Text style={styles.runLocation}>{item.location}</Text>}
      
      <View style={styles.runMetrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{item.distance}</Text>
          <Text style={styles.metricLabel}>km</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{item.pace}</Text>
          <Text style={styles.metricLabel}>/km</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{Math.floor(item.duration / 60)}'</Text>
          <Text style={styles.metricLabel}>durata</Text>
        </View>
        {item.avg_heart_rate && (
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{item.avg_heart_rate}</Text>
            <Text style={styles.metricLabel}>bpm</Text>
          </View>
        )}
      </View>
      
      {item.notes && <Text style={styles.runNotes} numberOfLines={2}>{item.notes}</Text>}
      
      {item.verdict && (
        <View style={[styles.verdictBadge, { 
          backgroundColor: item.verdict === 'perfetto' ? theme.colors.success : 
                          item.verdict === 'ok' ? theme.colors.info :
                          item.verdict === 'troppo_lento' ? theme.colors.warning :
                          item.verdict === 'troppo_veloce' ? theme.colors.error :
                          theme.colors.surfaceElevated
        }]}>
          <Text style={styles.verdictText}>
            {item.verdict === 'perfetto' ? '✓ Perfetto' :
             item.verdict === 'ok' ? '✓ OK' :
             item.verdict === 'troppo_lento' ? '⚠ Lento' :
             item.verdict === 'troppo_veloce' ? '⚠ Veloce' :
             'Extra'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Ionicons name="loader" size={32} color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Corse</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.km.toFixed(1)}</Text>
          <Text style={styles.statLabel}>km Totali</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.avgPace.toFixed(0)}:XX</Text>
          <Text style={styles.statLabel}>Passo Medio</Text>
        </View>
      </View>

      {/* Runs List */}
      <FlatList
        data={runs}
        renderItem={renderRun}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB: Add Run */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/add-run')}
      >
        <Ionicons name="add" size={24} color={theme.colors.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  runCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  runHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  runDate: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  typeBadge: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadgeText: {
    fontSize: theme.fontSize.md,
  },
  runLocation: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.md,
  },
  runMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  metricLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
  },
  runNotes: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
    fontStyle: 'italic',
  },
  verdictBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  verdictText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xxl,
    right: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
