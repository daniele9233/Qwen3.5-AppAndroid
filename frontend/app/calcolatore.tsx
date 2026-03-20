import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';

export default function Calcolatore() {
  const [activeTab, setActiveTab] = useState<'vdot' | 'predictor' | 'converter'>('vdot');
  
  // VDOT tab
  const [vdot, setVdot] = useState('48.7');
  
  // Predictor tab
  const [pbDistance, setPbDistance] = useState('10');
  const [pbTime, setPbTime] = useState('46:30');
  
  // Converter tab
  const [pace, setPace] = useState('5:00');

  const vdotPaces = {
    easy: '5:36',
    marathon: '5:06',
    threshold: '4:44',
    interval: '4:22',
    repetition: '4:08',
  };

  const predictions = {
    '5': '22:30',
    '10': '46:30',
    '15': '1:10:45',
    '21.1': '1:35:00',
    '42.2': '3:15:00',
  };

  const paceToSpeed = () => {
    const parts = pace.split(':');
    const min = parseInt(parts[0]);
    const sec = parseInt(parts[1]) || 0;
    const paceMin = min + sec / 60;
    const speed = 60 / paceMin;
    return speed.toFixed(1);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Tab Selector */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'vdot' && styles.activeTab]}
          onPress={() => setActiveTab('vdot')}
        >
          <Text style={[styles.tabText, activeTab === 'vdot' && styles.activeTabText]}>VDOT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'predictor' && styles.activeTab]}
          onPress={() => setActiveTab('predictor')}
        >
          <Text style={[styles.tabText, activeTab === 'predictor' && styles.activeTabText]}>Previsioni</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'converter' && styles.activeTab]}
          onPress={() => setActiveTab('converter')}
        >
          <Text style={[styles.tabText, activeTab === 'converter' && styles.activeTabText]}>Convertitore</Text>
        </TouchableOpacity>
      </View>

      {/* VDOT Tab */}
      {activeTab === 'vdot' && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Passi da VDOT</Text>
            <TextInput
              style={styles.input}
              value={vdot}
              onChangeText={setVdot}
              keyboardType="decimal-pad"
            />
            <Text style={styles.label}>Inserisci il tuo VDOT</Text>
          </View>

          <View style={styles.card}>
            {Object.entries(vdotPaces).map(([zone, paceVal]) => (
              <View key={zone} style={styles.paceRow}>
                <Text style={styles.paceLabel}>
                  {zone === 'easy' && '🟢'}
                  {zone === 'marathon' && '🔵'}
                  {zone === 'threshold' && '🟡'}
                  {zone === 'interval' && '🔴'}
                  {zone === 'repetition' && '⚪'}
                  {' '}{zone.charAt(0).toUpperCase() + zone.slice(1)}
                </Text>
                <Text style={styles.paceValue}>{paceVal}/km</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Predictor Tab */}
      {activeTab === 'predictor' && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Inserisci PB</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={pbDistance}
                onChangeText={setPbDistance}
                keyboardType="number-pad"
                placeholder="Distanza (km)"
                placeholderTextColor={theme.colors.textMuted}
              />
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: theme.spacing.sm }]}
                value={pbTime}
                onChangeText={setPbTime}
                placeholder="Tempo (mm:ss)"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Previsioni</Text>
            {Object.entries(predictions).map(([dist, time]) => (
              <View key={dist} style={styles.predictionRow}>
                <Text style={styles.predictionDist}>{dist} km</Text>
                <Text style={styles.predictionTime}>{time}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Converter Tab */}
      {activeTab === 'converter' && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Convertitore Passo/Velocità</Text>
            <TextInput
              style={styles.input}
              value={pace}
              onChangeText={setPace}
              placeholder="5:00"
              placeholderTextColor={theme.colors.textMuted}
            />
            <Text style={styles.result}>
              {paceToSpeed()} km/h
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={theme.colors.info} />
            <Text style={styles.infoText}>
              Un passo di {pace}/km corrisponde a {paceToSpeed()} km/h
            </Text>
          </View>
        </>
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
  tabs: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.accent,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  activeTabText: {
    color: theme.colors.background,
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
  input: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  paceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  predictionDist: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  },
  predictionTime: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  result: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    flex: 1,
  },
});
