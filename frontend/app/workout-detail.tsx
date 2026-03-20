import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api, TrainingWeek, Session } from '@/src/api';

export default function WorkoutDetail() {
  const { sessionId, weekId } = useLocalSearchParams<{ sessionId: string; weekId?: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [week, setWeek] = useState<TrainingWeek | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadWorkout();
  }, [sessionId, weekId]);

  const loadWorkout = async () => {
    try {
      if (weekId) {
        const weekData = await api.getWeek(weekId);
        setWeek(weekData);
        const foundSession = weekData.sessions.find(s => s.id === sessionId);
        if (foundSession) {
          setSession(foundSession);
          setCompleted(foundSession.completed);
        }
      }
    } catch (error) {
      console.error('Error loading workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async () => {
    setUpdating(true);
    try {
      await api.completeSession(sessionId!, !completed);
      setCompleted(!completed);
      if (weekId) loadWorkout(); // Reload
    } catch (error) {
      console.error('Error updating session:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !session) {
    return (
      <View style={styles.centered}>
        <Ionicons name="loader" size={32} color={theme.colors.accent} />
        <Text style={styles.loadingText}>Caricamento...</Text>
      </View>
    );
  }

  const sessionType = theme.sessionTypes[session.type as keyof typeof theme.sessionTypes] || theme.sessionTypes.corsaLenta;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: sessionType.color }]}>
          <Text style={styles.iconEmoji}>{sessionType.icon}</Text>
        </View>
        <Text style={styles.title}>{session.title}</Text>
      </View>

      {/* Type Badge */}
      <View style={[styles.typeBadge, { backgroundColor: sessionType.color }]}>
        <Text style={styles.typeBadgeText}>{sessionType.label}</Text>
      </View>

      {/* Description */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Descrizione</Text>
        <Text style={styles.description}>{session.description}</Text>
      </View>

      {/* Targets */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Obiettivi</Text>
        <View style={styles.targets}>
          {session.targetDistance && (
            <View style={styles.targetItem}>
              <Ionicons name="route" size={20} color={theme.colors.accent} />
              <View style={styles.targetInfo}>
                <Text style={styles.targetLabel}>Distanza</Text>
                <Text style={styles.targetValue}>{session.targetDistance} km</Text>
              </View>
            </View>
          )}
          {session.targetPace && (
            <View style={styles.targetItem}>
              <Ionicons name="timer" size={20} color={theme.colors.accent} />
              <View style={styles.targetInfo}>
                <Text style={styles.targetLabel}>Passo</Text>
                <Text style={styles.targetValue}>{session.targetPace}/km</Text>
              </View>
            </View>
          )}
          {session.targetDuration && (
            <View style={styles.targetItem}>
              <Ionicons name="hourglass" size={20} color={theme.colors.accent} />
              <View style={styles.targetInfo}>
                <Text style={styles.targetLabel}>Durata</Text>
                <Text style={styles.targetValue}>{session.targetDuration}'</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Week Info */}
      {week && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settimana {week.week_number}</Text>
          <View style={[styles.phaseBadge, { backgroundColor: theme.phases[week.phase as keyof typeof theme.phases]?.color || theme.colors.border }]}>
            <Text style={styles.phaseBadgeText}>
              {theme.phases[week.phase as keyof typeof theme.phases]?.label || week.phase}
            </Text>
          </View>
          <Text style={styles.weekInfo}>
            {new Date(week.start_date).toLocaleDateString('it-IT')} - {new Date(week.end_date).toLocaleDateString('it-IT')}
          </Text>
        </View>
      )}

      {/* Complete Toggle */}
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Ionicons name="checkmark-circle" size={24} color={completed ? theme.colors.success : theme.colors.textMuted} />
            <Text style={[styles.toggleLabel, completed && { color: theme.colors.success }]}>
              {completed ? 'Completata' : 'Da completare'}
            </Text>
          </View>
          <Switch
            value={completed}
            onValueChange={toggleComplete}
            disabled={updating}
            trackColor={{ false: theme.colors.border, true: theme.colors.success }}
            thumbColor={theme.colors.background}
          />
        </View>
      </View>

      {/* Actions */}
      {session.type === 'corsa_lenta' || session.type === 'lungo' ? (
        <TouchableOpacity
          style={styles.recordButton}
          onPress={() => router.push('/add-run')}
        >
          <Ionicons name="play" size={20} color={theme.colors.background} />
          <Text style={styles.recordButtonText}>Registra Corsa</Text>
        </TouchableOpacity>
      ) : null}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  iconEmoji: {
    fontSize: theme.fontSize.xxxl,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    flex: 1,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.lg,
  },
  typeBadgeText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
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
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.md,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    lineHeight: 20,
  },
  targets: {
    gap: theme.spacing.md,
  },
  targetItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetInfo: {
    marginLeft: theme.spacing.md,
  },
  targetLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  targetValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  phaseBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  phaseBadgeText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  weekInfo: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    marginLeft: theme.spacing.sm,
  },
  recordButton: {
    backgroundColor: theme.colors.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  recordButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
});
