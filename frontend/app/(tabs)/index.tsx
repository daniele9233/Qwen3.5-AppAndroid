import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api, DashboardData, Session } from '@/src/api';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await api.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = async (session: Session) => {
    try {
      await api.completeSession(session.id, true);
      loadDashboard(); // Refresh
    } catch (error) {
      console.error('Error marking session complete:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Ionicons name="loader" size={32} color={theme.colors.accent} />
        <Text style={styles.loadingText}>Caricamento...</Text>
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Errore nel caricamento dei dati</Text>
        <TouchableOpacity onPress={loadDashboard} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Riprova</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { countdown, todaySession, weeklyProgress, profile } = dashboard;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Countdown Header */}
      <View style={styles.countdownCard}>
        <Text style={styles.countdownLabel}>Mezza Maratona Corralejo</Text>
        <Text style={styles.countdownValue}>
          {countdown.days}g {countdown.hours}h {countdown.minutes}m
        </Text>
        <Text style={styles.countdownSub}>al traguardo</Text>
      </View>

      {/* Today's Session */}
      {todaySession && (
        <View style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <View style={[styles.sessionBadge, { backgroundColor: theme.sessionTypes[todaySession.type].color }]}>
              <Text style={styles.sessionBadgeText}>{theme.sessionTypes[todaySession.type].icon}</Text>
            </View>
            <Text style={styles.sessionTitle}>{todaySession.title}</Text>
          </View>
          <Text style={styles.sessionDescription}>{todaySession.description}</Text>
          
          <View style={styles.sessionTargets}>
            {todaySession.targetDistance && (
              <Text style={styles.sessionTarget}>📏 {todaySession.targetDistance} km</Text>
            )}
            {todaySession.targetPace && (
              <Text style={styles.sessionTarget}>⏱️ {todaySession.targetPace}/km</Text>
            )}
            {todaySession.targetDuration && (
              <Text style={styles.sessionTarget}>⏰ {todaySession.targetDuration}'</Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.markDoneButton}
            onPress={() => handleMarkDone(todaySession)}
          >
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.background} />
            <Text style={styles.markDoneText}>SEGNA FATTO</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Weekly Progress */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Progresso Settimanale</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(weeklyProgress.completed / weeklyProgress.total) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {weeklyProgress.completed} / {weeklyProgress.total} sessioni
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile.kmMaxSettimanali}</Text>
          <Text style={styles.statLabel}>km target</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile.targetPace}</Text>
          <Text style={styles.statLabel}>passo obiettivo</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile.targetTime}</Text>
          <Text style={styles.statLabel}>tempo mezza</Text>
        </View>
      </View>

      {/* Recent Runs */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Corse Recenti</Text>
        {dashboard.recentRuns.slice(0, 3).map((run) => (
          <TouchableOpacity 
            key={run.id} 
            style={styles.runItem}
            onPress={() => {/* Navigate to run detail */}}
          >
            <View style={styles.runInfo}>
              <Text style={styles.runDate}>{new Date(run.date).toLocaleDateString('it-IT')}</Text>
              <Text style={styles.runDistance}>{run.distance} km</Text>
            </View>
            <View style={styles.runMetrics}>
              <Text style={styles.runPace}>{run.pace}/km</Text>
              <Text style={styles.runDuration}>{Math.floor(run.duration / 60)}'</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Weekly Timeline */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Questa Settimana</Text>
        <View style={styles.timeline}>
          {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((day, index) => (
            <View key={index} style={styles.timelineDay}>
              <Text style={styles.timelineDayLabel}>{day}</Text>
              <View style={[
                styles.timelineDot,
                { backgroundColor: index === new Date().getDay() - 1 ? theme.colors.accent : theme.colors.border }
              ]} />
            </View>
          ))}
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
  loadingText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.background,
    fontWeight: theme.fontWeight.semibold,
  },
  countdownCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  countdownLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.xs,
  },
  countdownValue: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
  },
  countdownSub: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  sessionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sessionBadge: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  sessionBadgeText: {
    fontSize: theme.fontSize.lg,
  },
  sessionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    flex: 1,
  },
  sessionDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  sessionTargets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sessionTarget: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  markDoneButton: {
    backgroundColor: theme.colors.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  markDoneText: {
    color: theme.colors.background,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.full,
  },
  progressText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    textAlign: 'center',
  },
  runItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  runInfo: {
    flex: 1,
  },
  runDate: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  runDistance: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  runMetrics: {
    alignItems: 'flex-end',
  },
  runPace: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  runDuration: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineDay: {
    alignItems: 'center',
  },
  timelineDayLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: theme.borderRadius.full,
  },
});
