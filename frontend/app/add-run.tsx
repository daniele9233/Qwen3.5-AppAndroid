import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api } from '@/src/api';

export default function AddRun() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [distance, setDistance] = useState('');
  const [durationMin, setDurationMin] = useState('');
  const [durationSec, setDurationSec] = useState('');
  const [pace, setPace] = useState('');
  const [avgHr, setAvgHr] = useState('');
  const [maxHr, setMaxHr] = useState('');
  const [type, setType] = useState('corsa_lenta');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const calculatePace = () => {
    const dist = parseFloat(distance);
    const min = parseInt(durationMin) || 0;
    const sec = parseInt(durationSec) || 0;
    if (dist > 0 && (min > 0 || sec > 0)) {
      const totalMin = min + sec / 60;
      const paceMin = Math.floor(totalMin / dist);
      const paceSec = Math.round(((totalMin / dist) - paceMin) * 60);
      setPace(`${paceMin}:${paceSec.toString().padStart(2, '0')}`);
    }
  };

  const calculateDuration = () => {
    const dist = parseFloat(distance);
    const paceParts = pace.split(':');
    if (dist > 0 && paceParts.length === 2) {
      const paceMin = parseInt(paceParts[0]);
      const paceSec = parseInt(paceParts[1]);
      const totalMin = (paceMin + paceSec / 60) * dist;
      setDurationMin(Math.floor(totalMin).toString());
      setDurationSec(Math.round((totalMin - Math.floor(totalMin)) * 60).toString());
    }
  };

  const handleSubmit = async () => {
    if (!distance || (!durationMin && !pace)) {
      Alert.alert('Errore', 'Inserisci almeno distanza e durata oppure distanza e passo');
      return;
    }

    setLoading(true);
    try {
      const min = parseInt(durationMin) || 0;
      const sec = parseInt(durationSec) || 0;
      const duration = min * 60 + sec;

      await api.createRun({
        date,
        distance: parseFloat(distance),
        duration: duration || undefined,
        pace: pace || undefined,
        avgHeartRate: avgHr ? parseInt(avgHr) : undefined,
        maxHeartRate: maxHr ? parseInt(maxHr) : undefined,
        type,
        location: location || undefined,
        notes: notes || undefined,
      });

      Alert.alert('Successo', 'Corsa registrata!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Errore', 'Impossibile registrare la corsa');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sessionTypes = [
    { value: 'corsa_lenta', label: 'Corsa Lenta', icon: '🏃' },
    { value: 'lungo', label: 'Lungo', icon: '🏃‍♂️' },
    { value: 'ripetute', label: 'Ripetute', icon: '⚡' },
    { value: 'progressivo', label: 'Progressivo', icon: '📈' },
    { value: 'test', label: 'Test', icon: '🎯' },
    { value: 'gara', label: 'Gara', icon: '🏆' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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

      {/* Distance */}
      <View style={styles.field}>
        <Text style={styles.label}>Distanza (km)</Text>
        <TextInput
          style={styles.input}
          value={distance}
          onChangeText={setDistance}
          onBlur={calculatePace}
          placeholder="0.0"
          placeholderTextColor={theme.colors.textMuted}
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
              onBlur={calculatePace}
              placeholder="min"
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
              onBlur={calculatePace}
              placeholder="sec"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="number-pad"
            />
          </View>
        </View>
      </View>

      {/* Pace */}
      <View style={styles.field}>
        <Text style={styles.label}>Passo (/km)</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={pace}
            onChangeText={(val) => {
              setPace(val);
              if (val.includes(':')) calculateDuration();
            }}
            placeholder="min:sec"
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={styles.paceLabel}>/km</Text>
        </View>
      </View>

      {/* Heart Rate */}
      <View style={styles.row}>
        <View style={[styles.field, { flex: 1, marginRight: theme.spacing.sm }]}>
          <Text style={styles.label}>FC Media</Text>
          <TextInput
            style={styles.input}
            value={avgHr}
            onChangeText={setAvgHr}
            placeholder="bpm"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="number-pad"
          />
        </View>
        <View style={[styles.field, { flex: 1, marginLeft: theme.spacing.sm }]}>
          <Text style={styles.label}>FC Max</Text>
          <TextInput
            style={styles.input}
            value={maxHr}
            onChangeText={setMaxHr}
            placeholder="bpm"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Type */}
      <View style={styles.field}>
        <Text style={styles.label}>Tipo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          {sessionTypes.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[
                styles.typeButton,
                type === t.value && { backgroundColor: theme.colors.accent }
              ]}
              onPress={() => setType(t.value)}
            >
              <Text style={styles.typeEmoji}>{t.icon}</Text>
              <Text style={[
                styles.typeLabel,
                type === t.value && { color: theme.colors.background }
              ]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Location */}
      <View style={styles.field}>
        <Text style={styles.label}>Luogo (opzionale)</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Es. Parco, Stadio..."
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>

      {/* Notes */}
      <View style={styles.field}>
        <Text style={styles.label}>Note (opzionale)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Come ti sei sentito?"
          placeholderTextColor={theme.colors.textMuted}
          multiline
          numberOfLines={4}
        />
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
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.background} />
            <Text style={styles.submitButtonText}>SALVA CORSA</Text>
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
  paceLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.lg,
    marginLeft: theme.spacing.sm,
  },
  typeScroll: {
    flexDirection: 'row',
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeEmoji: {
    fontSize: theme.fontSize.xl,
    marginRight: theme.spacing.xs,
  },
  typeLabel: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
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
