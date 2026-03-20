import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api, TrainingPlan } from '@/src/api';

export default function Periodizzazione() {
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const data = await api.getTrainingPlan();
      setPlan(data);
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !plan) {
    return (
      <View style={styles.centered}>
        <Ionicons name="loader" size={32} color={theme.colors.accent} />
      </View>
    );
  }

  // Group weeks by phase
  const phaseStats: Record<string, { weeks: number; km: number; completed: number }> = {};
  plan.phases.forEach((phase) => {
    const phaseWeeks = plan.weeks.filter(w => w.phase === phase.id);
    phaseStats[phase.id] = {
      weeks: phaseWeeks.length,
      km: phaseWeeks.reduce((sum, w) => sum + w.km_target, 0),
      completed: phaseWeeks.filter(w => w.completed).length,
    };
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Periodizzazione 38 Settimane</Text>

      {/* Phase Cards */}
      {plan.phases.map((phase, index) => {
        const stats = phaseStats[phase.id];
        const phaseColor = theme.phases[phase.id as keyof typeof theme.phases]?.color || theme.colors.border;
        
        return (
          <View key={phase.id} style={[styles.phaseCard, { borderLeftColor: phaseColor }]}>
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseName}>{phase.name}</Text>
              <Text style={styles.phaseWeeks}>Sett. {phase.startWeek}-{phase.endWeek}</Text>
            </View>
            
            <View style={styles.phaseStats}>
              <View style={styles.phaseStatItem}>
                <Text style={styles.phaseStatValue}>{stats.weeks}</Text>
                <Text style={styles.phaseStatLabel}>settimane</Text>
              </View>
              <View style={styles.phaseStatItem}>
                <Text style={styles.phaseStatValue}>{stats.km}</Text>
                <Text style={styles.phaseStatLabel}>km totali</Text>
              </View>
              <View style={styles.phaseStatItem}>
                <Text style={styles.phaseStatValue}>{stats.completed}</Text>
                <Text style={styles.phaseStatLabel}>completate</Text>
              </View>
            </View>
          </View>
        );
      })}

      {/* Weekly Bars */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Volume Settimanale</Text>
        <View style={styles.barsContainer}>
          {plan.weeks.map((week, index) => {
            const phaseColor = theme.phases[week.phase as keyof typeof theme.phases]?.color || theme.colors.border;
            const maxKm = 65;
            const height = (week.km_target / maxKm) * 100;
            
            return (
              <View key={week.id} style={styles.barWrapper}>
                <View style={[styles.bar, { height, backgroundColor: phaseColor }]} />
                <Text style={styles.barLabel}>{week.week_number}</Text>
              </View>
            );
          })}
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
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
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
  phaseCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  phaseName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  phaseWeeks: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  phaseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  phaseStatItem: {
    alignItems: 'center',
  },
  phaseStatValue: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  phaseStatLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    gap: 2,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: 2,
    minHeight: 4,
  },
  barLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
});
