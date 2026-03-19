import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api, TrainingPlan, TrainingWeek, Session } from '@/src/api';

export default function Piano() {
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [currentWeek, setCurrentWeek] = useState<TrainingWeek | null>(null);
  const [viewMode, setViewMode] = useState<'lista' | 'calendario'>('lista');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [planData, weekData] = await Promise.all([
        api.getTrainingPlan(),
        api.getCurrentWeek().catch(() => null),
      ]);
      setPlan(planData);
      setCurrentWeek(weekData);
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSession = async (sessionId: string, completed: boolean) => {
    try {
      await api.completeSession(sessionId, completed);
      loadData(); // Refresh
    } catch (error) {
      console.error('Error toggling session:', error);
    }
  };

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      ripresa: '#22c55e', base_aerobica: '#3b82f6', sviluppo: '#eab308',
      prep_specifica: '#f97316', picco: '#ef4444', tapering: '#fafafa',
    };
    return colors[phase] || theme.colors.border;
  };

  const getPhaseEmoji = (phase: string) => {
    const emojis: Record<string, string> = {
      ripresa: '🟢', base_aerobica: '🔵', sviluppo: '🟡',
      prep_specifica: '🟠', picco: '🔴', tapering: '⚪',
    };
    return emojis[phase] || '⚪';
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Ionicons name="loader" size={32} color={theme.colors.accent} />
        <Text style={styles.loadingText}>Caricamento piano...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Errore nel caricamento del piano</Text>
        <TouchableOpacity onPress={loadData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Riprova</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Phase Progress Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.phaseBar}>
        {plan.phases.map((phase) => (
          <View key={phase.id} style={styles.phaseItem}>
            <View style={[styles.phaseDot, { backgroundColor: phase.color }]} />
            <Text style={styles.phaseLabel}>{phase.name}</Text>
          </View>
        ))}
      </ScrollView>

      {/* View Toggle */}
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Vista:</Text>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'lista' && styles.toggleButtonActive]}
          onPress={() => setViewMode('lista')}
        >
          <Ionicons name="list" size={16} color={viewMode === 'lista' ? theme.colors.background : theme.colors.textSecondary} />
          <Text style={[styles.toggleText, viewMode === 'lista' && styles.toggleTextActive]}>Lista</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'calendario' && styles.toggleButtonActive]}
          onPress={() => setViewMode('calendario')}
        >
          <Ionicons name="calendar" size={16} color={viewMode === 'calendario' ? theme.colors.background : theme.colors.textSecondary} />
          <Text style={[styles.toggleText, viewMode === 'calendario' && styles.toggleTextActive]}>Calendario</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {viewMode === 'lista' ? (
          /* List View */
          plan.weeks.map((week) => (
            <View key={week.id} style={styles.weekCard}>
              <View style={styles.weekHeader}>
                <Text style={styles.weekTitle}>Settimana {week.week_number}</Text>
                <View style={[styles.phaseBadge, { backgroundColor: getPhaseColor(week.phase) }]}>
                  <Text style={styles.phaseBadgeText}>{getPhaseEmoji(week.phase)} {week.phase.replace('_', ' ')}</Text>
                </View>
              </View>
              
              <View style={styles.weekStats}>
                <Text style={styles.weekKm}>{week.km_target} km target</Text>
                {week.is_recovery && <Text style={styles.recoveryBadge}>🔄 Recupero</Text>}
              </View>

              <View style={styles.sessionsList}>
                {week.sessions.map((session) => (
                  <TouchableOpacity 
                    key={session.id}
                    style={[styles.sessionRow, session.completed && styles.sessionCompleted]}
                    onPress={() => toggleSession(session.id, !session.completed)}
                  >
                    <View style={styles.sessionLeft}>
                      <Text style={styles.sessionDay}>{session.day.substring(0, 3).toUpperCase()}</Text>
                      <View style={[styles.sessionTypeDot, { backgroundColor: theme.sessionTypes[session.type as keyof typeof theme.sessionTypes]?.color || theme.colors.info }]} />
                    </View>
                    <View style={styles.sessionMiddle}>
                      <Text style={styles.sessionTitle}>{session.title}</Text>
                      <Text style={styles.sessionDesc} numberOfLines={1}>{session.description}</Text>
                    </View>
                    <View style={styles.sessionRight}>
                      {session.target_distance && <Text style={styles.sessionTarget}>{session.target_distance}km</Text>}
                      {session.target_pace && <Text style={styles.sessionPace}>{session.target_pace}</Text>}
                      <Switch
                        value={session.completed}
                        onValueChange={(val) => toggleSession(session.id, val)}
                        trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                        thumbColor={theme.colors.background}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        ) : (
          /* Calendar View - Simplified */
          <View style={styles.calendarView}>
            <Text style={styles.calendarNote}>Vista calendario: funzionalità in sviluppo</Text>
            {plan.weeks.slice(0, 4).map((week) => (
              <View key={week.id} style={styles.calendarWeek}>
                <Text style={styles.calendarWeekTitle}>Sett. {week.week_number}</Text>
                <View style={styles.calendarDays}>
                  {['L','M','M','G','V','S','D'].map((day, i) => (
                    <View key={i} style={styles.calendarDay}>
                      <Text style={styles.calendarDayLabel}>{day}</Text>
                      <View style={[styles.calendarDot, { backgroundColor: getPhaseColor(week.phase) }]} />
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Adapt Plan Button */}
      <TouchableOpacity style={styles.adaptButton} onPress={() => api.adaptPlan()}>
        <Ionicons name="refresh" size={18} color={theme.colors.background} />
        <Text style={styles.adaptButtonText}>Adatta Piano</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  loadingText: { color: theme.colors.textSecondary, marginTop: theme.spacing.md },
  errorText: { color: theme.colors.error, marginBottom: theme.spacing.md },
  retryButton: { backgroundColor: theme.colors.accent, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.md },
  retryButtonText: { color: theme.colors.background, fontWeight: theme.fontWeight.semibold },
  
  phaseBar: { flexDirection: 'row', padding: theme.spacing.sm, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  phaseItem: { alignItems: 'center', paddingHorizontal: theme.spacing.md },
  phaseDot: { width: 10, height: 10, borderRadius: 5, marginBottom: theme.spacing.xs },
  phaseLabel: { color: theme.colors.textSecondary, fontSize: theme.fontSize.xs },
  
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg, gap: theme.spacing.md },
  toggleLabel: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  toggleButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.md, borderRadius: theme.borderRadius.sm, borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.xs },
  toggleButtonActive: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  toggleText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  toggleTextActive: { color: theme.colors.background, fontWeight: theme.fontWeight.medium },
  
  content: { flex: 1, padding: theme.spacing.lg },
  weekCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  weekTitle: { color: theme.colors.text, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold },
  phaseBadge: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs, borderRadius: theme.borderRadius.sm },
  phaseBadgeText: { color: theme.colors.background, fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.medium },
  
  weekStats: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  weekKm: { color: theme.colors.accent, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold },
  recoveryBadge: { color: theme.colors.info, fontSize: theme.fontSize.xs, backgroundColor: theme.colors.surfaceElevated, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, borderRadius: theme.borderRadius.sm },
  
  sessionsList: { gap: theme.spacing.sm },
  sessionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  sessionCompleted: { opacity: 0.6 },
  sessionLeft: { alignItems: 'center', width: 50 },
  sessionDay: { color: theme.colors.textSecondary, fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.medium },
  sessionTypeDot: { width: 8, height: 8, borderRadius: 4, marginTop: theme.spacing.xs },
  sessionMiddle: { flex: 1, paddingHorizontal: theme.spacing.md },
  sessionTitle: { color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.medium },
  sessionDesc: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
  sessionRight: { alignItems: 'flex-end', gap: theme.spacing.xs },
  sessionTarget: { color: theme.colors.text, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold },
  sessionPace: { color: theme.colors.accent, fontSize: theme.fontSize.xs },
  
  calendarView: { gap: theme.spacing.lg },
  calendarNote: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, textAlign: 'center', padding: theme.spacing.lg },
  calendarWeek: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md },
  calendarWeekTitle: { color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold, marginBottom: theme.spacing.sm },
  calendarDays: { flexDirection: 'row', justifyContent: 'space-between' },
  calendarDay: { alignItems: 'center' },
  calendarDayLabel: { color: theme.colors.textSecondary, fontSize: theme.fontSize.xs, marginBottom: theme.spacing.xs },
  calendarDot: { width: 12, height: 12, borderRadius: 6 },
  
  adaptButton: { position: 'absolute', bottom: theme.spacing.xxl, right: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.accent, paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg, borderRadius: theme.borderRadius.md, gap: theme.spacing.sm },
  adaptButtonText: { color: theme.colors.background, fontWeight: theme.fontWeight.semibold, fontSize: theme.fontSize.md },
});
