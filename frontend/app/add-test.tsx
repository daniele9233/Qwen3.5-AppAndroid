import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api } from '@/src/api';

export default function AddTest() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('5km');
  const [distance, setDistance] = useState('5');
  const [durationMin, setDurationMin] = useState('');
  const [durationSec, setDurationSec] = useState('');

  const testTypes = [
    { value: '5km', label: '5 km', distance: '5' },
    { value: '10km', label: '10 km', distance: '10' },
    { value: '15km', label: '15 km', distance: '15' },
    { value: '21.1km', label: '21.1 km', distance: '21.1' },
  ];

  const handleTypeChange = (testType: string) => {
    setType(testType);
    const selected = testTypes.find(t => t.value === testType);
    if (selected) setDistance(selected.distance);
  };

  const handleSubmit = async () => {
    if (!durationMin) {
      Alert.alert('Errore', 'Inserisci la durata del test');
      return;
    }

    setLoading(true);
    try {
      const min = parseInt(durationMin);
      const sec = parseInt(durationSec) || 0;
      const duration = min * 60 + sec;
      const dist = parseFloat(distance);
      const paceMin = Math.floor(duration / dist / 60);
      const paceSec = Math.round(((duration / dist) % 60));

      await api.createRun({
        date,
        distance: dist,
        duration,
        pace: `${paceMin}:${paceSec.toString().padStart(2, '0')}`,
        type: 'test',
        notes: `Test ${type}`,
      });

      Alert.alert('Successo', 'Test registrato!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Errore', 'Impossibile registrare il test');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nuovo Test</Text>

      {/* Date */}
      <View style={styles.field}>
        <Text style={styles.label}>Data</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>

      {/* Test Type */}
      <View style={styles.field}>
        <Text style={styles.label}>Tipo Test</Text>
        <View style={styles.typeGrid}>
          {testTypes.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[
                styles.typeButton,
                type === t.value && { backgroundColor: theme.colors.accent }
              ]}
              onPress={() => handleTypeChange(t.value)}
            >
              <Text style={[
                styles.typeButtonText,
                type === t.value && { color: theme.colors.background }
              ]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Distance */}
      <View style={styles.field}>
        <Text style={styles.label}>Distanza (km)</Text>
        <TextInput
          style={styles.input}
          value={distance}
          onChangeText={setDistance}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Duration */}
      <View style={styles.field}>
        <Text style={styles.label}>Durata</Text>
        <View style={styles.row}>
          <View style={styles.durationInput}>
            <TextInput
              style={styles.input}
              value={durationMin}
              onChangeText={setDurationMin}
              placeholder="minuti"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="number-pad"
            />
          </View>
          <Text style={styles.durationSeparator}>:</Text>
          <View style={styles.durationInput}>
            <TextInput
              style={styles.input}
              value={durationSec}
              onChangeText={setDurationSec}
              placeholder="secondi"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="number-pad"
            />
          </View>
        </View>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <Ionicons name="loader" size={24} color={theme.colors.background} />
        ) : (
          <>
            <Ionicons name="analytics" size={24} color={theme.colors.background} />
            <Text style={styles.submitButtonText}>SALVA TEST</Text>
          </>
        )}
      </TouchableOpacity>
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
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  field: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationInput: {
    flex: 1,
  },
  durationSeparator: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    marginHorizontal: theme.spacing.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  submitButton: {
    backgroundColor: theme.colors.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
});
