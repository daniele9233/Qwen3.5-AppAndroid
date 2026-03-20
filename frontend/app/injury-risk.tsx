import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api, InjuryRiskData } from '@/src/api';

export default function InjuryRisk() {
  const [data, setData] = useState<InjuryRiskData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await api.getInjuryRisk();
      setData(result);
    } catch (error) {
      console.error('Error loading injury risk:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <View style={styles.centered}>
        <Ionicons name="loader" size={32} color={theme.colors.accent} />
      </View>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'basso': return theme.colors.success;
      case 'medio': return theme.colors.warning;
      case 'alto': return theme.colors.error;
      case 'critico': return '#7c3aed';
      default: return theme.colors.border;
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'basso': return 'checkmark-circle';
      case 'medio': return 'alert';
      case 'alto': return 'warning';
      case 'critico': return 'radioactive';
      default: return 'help-circle';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Risk Gauge */}
      <View style={[styles.gaugeCard, { borderColor: getRiskColor(data.level) }]}>
        <View style={styles.gaugeHeader}>
          <Ionicons name={getRiskIcon(data.level)} size={32} color={getRiskColor(data.level)} />
          <Text style={styles.gaugeTitle}>Injury Risk Score</Text>
        </View>
        
        <View style={styles.gaugeValueContainer}>
          <Text style={[styles.gaugeValue, { color: getRiskColor(data.level) }]}>{data.score}</Text>
          <Text style={[styles.gaugeLevel, { color: getRiskColor(data.level) }]}>
            {data.level === 'basso' && '✓ Basso'}
            {data.level === 'medio' && '⚠ Medio'}
            {data.level === 'alto' && '⚡ Alto'}
            {data.level === 'critico' && '🚨 Critico'}
          </Text>
        </View>

        {/* Gauge Bar */}
        <View style={styles.gaugeBar}>
          <View style={styles.gaugeSegments}>
            <View style={[styles.gaugeSegment, { backgroundColor: theme.colors.success }]} />
            <View style={[styles.gaugeSegment, { backgroundColor: theme.colors.warning }]} />
            <View style={[styles.gaugeSegment, { backgroundColor: theme.colors.error }]} />
            <View style={[styles.gaugeSegment, { backgroundColor: '#7c3aed' }]} />
          </View>
          <View 
            style={[
              styles.gaugeIndicator, 
              { left: `${Math.min(data.score, 100)}%`, backgroundColor: getRiskColor(data.level) }
            ]} 
          />
        </View>
      </View>

      {/* Risk Factors */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fattori di Rischio</Text>
        
        <View style={styles.factorRow}>
          <View style={styles.factorItem}>
            <Text style={styles.factorLabel}>Carico Settimanale</Text>
            <Text style={styles.factorValue}>{data.factors.weeklyLoad.toFixed(0)} km</Text>
          </View>
          <View style={styles.factorItem}>
            <Text style={styles.factorLabel}>Variazione WoW</Text>
            <Text style={[styles.factorValue, data.factors.wowChange > 30 && { color: theme.colors.error }]}>
              {data.factors.wowChange > 0 ? '+' : ''}{data.factors.wowChange.toFixed(0)}%
            </Text>
          </View>
        </View>

        <View style={styles.factorRow}>
          <View style={styles.factorItem}>
            <Text style={styles.factorLabel}>Intensità Media</Text>
            <Text style={styles.factorValue}>{data.factors.intensity.toFixed(0)}%</Text>
          </View>
          <View style={styles.factorItem}>
            <Text style={styles.factorLabel}>Giorni Recupero</Text>
            <Text style={styles.factorValue}>{data.factors.recoveryDays}</Text>
          </View>
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Raccomandazioni</Text>
        {data.recommendations.map((rec, index) => (
          <View key={index} style={styles.recommendationItem}>
            <Ionicons name="bulb" size={20} color={theme.colors.accent} />
            <Text style={styles.recommendationText}>{rec}</Text>
          </View>
        ))}
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color={theme.colors.info} />
        <Text style={styles.infoText}>
          L'Injury Risk Score analizza il carico di allenamento per prevenire infortuni. 
          Mantieni il punteggio sotto 50 per ridurre i rischi.
        </Text>
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
  gaugeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  gaugeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  gaugeTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  gaugeValueContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  gaugeValue: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
  },
  gaugeLevel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    marginTop: theme.spacing.xs,
  },
  gaugeBar: {
    height: 12,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  gaugeSegments: {
    flexDirection: 'row',
    height: '100%',
  },
  gaugeSegment: {
    flex: 1,
    height: '100%',
  },
  gaugeIndicator: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 16,
    borderRadius: 2,
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
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  factorItem: {
    alignItems: 'center',
  },
  factorLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  factorValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  recommendationText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    flex: 1,
    lineHeight: 18,
  },
});
