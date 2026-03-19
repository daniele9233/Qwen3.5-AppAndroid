import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api, Profile, StravaProfile } from '@/src/api';

export default function Profilo() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stravaProfile, setStravaProfile] = useState<StravaProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'profilo' | 'medaglie' | 'integratori' | 'esercizi' | 'test'>('profilo');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, stravaData] = await Promise.all([
        api.getProfile(),
        api.getStravaProfile().catch(() => null),
      ]);
      setProfile(profileData);
      setStravaProfile(stravaData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectStrava = async () => {
    try {
      const { url } = await api.getStravaAuthUrl();
      // In production, use Linking.openURL(url)
      console.log('Strava auth URL:', url);
    } catch (error) {
      console.error('Error getting Strava auth URL:', error);
    }
  };

  const syncStrava = async () => {
    try {
      await api.syncStrava();
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error syncing Strava:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Ionicons name="loader" size={32} color={theme.colors.accent} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Errore nel caricamento del profilo</Text>
      </View>
    );
  }

  const tabs = [
    { id: 'profilo', label: 'Profilo', icon: 'person' },
    { id: 'medaglie', label: 'Medaglie', icon: 'trophy' },
    { id: 'integratori', label: 'Integratori', icon: 'tablet-landscape' },
    { id: 'esercizi', label: 'Esercizi', icon: 'barbell' },
    { id: 'test', label: 'Test', icon: 'speedometer' },
  ] as const;

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={18} 
              color={activeTab === tab.id ? theme.colors.background : theme.colors.textSecondary} 
            />
            <Text style={[
              styles.tabLabel,
              activeTab === tab.id && styles.tabLabelActive,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        {activeTab === 'profilo' && (
          <View style={styles.tabContent}>
            {/* Strava Connection */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔗 Strava</Text>
              {profile.stravaConnected && stravaProfile ? (
                <View style={styles.stravaConnected}>
                  <Image 
                    source={{ uri: stravaProfile.profile }} 
                    style={styles.avatar}
                  />
                  <View>
                    <Text style={styles.stravaName}>
                      {stravaProfile.firstname} {stravaProfile.lastname}
                    </Text>
                    <Text style={styles.stravaLocation}>
                      {stravaProfile.city}, {stravaProfile.country}
                    </Text>
                  </View>
                </View>
              ) : (
                <TouchableOpacity style={styles.stravaButton} onPress={connectStrava}>
                  <Image 
                    source={{ uri: 'https://cdn.strava.com/assets/badge/strava-badge-orange-2x.png' }}
                    style={styles.stravaBadge}
                  />
                  <Text style={styles.stravaButtonText}>Connetti Strava</Text>
                </TouchableOpacity>
              )}
              
              {profile.stravaConnected && (
                <TouchableOpacity style={styles.syncButton} onPress={syncStrava}>
                  <Ionicons name="refresh" size={16} color={theme.colors.background} />
                  <Text style={styles.syncButtonText}>Sync Attività</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Personal Data */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>👤 Dati Personali</Text>
              <View style={styles.dataGrid}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Età</Text>
                  <Text style={styles.dataValue}>{profile.age} anni</Text>
                </View>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Peso</Text>
                  <Text style={styles.dataValue}>{profile.weight} kg</Text>
                </View>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>FC Max</Text>
                  <Text style={styles.dataValue}>{profile.fc_max} bpm</Text>
                </View>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Km Max/Sett</Text>
                  <Text style={styles.dataValue}>{profile.km_max_settimanali}</Text>
                </View>
              </View>
            </View>

            {/* Target */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎯 Obiettivo Gara</Text>
              <View style={styles.targetRow}>
                <View style={styles.targetItem}>
                  <Text style={styles.targetValue}>{profile.target_time}</Text>
                  <Text style={styles.targetLabel}>Tempo Mezza</Text>
                </View>
                <View style={styles.targetItem}>
                  <Text style={styles.targetValue}>{profile.target_pace}/km</Text>
                  <Text style={styles.targetLabel}>Passo Target</Text>
                </View>
              </View>
            </View>

            {/* Personal Bests */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🏆 Personal Bests</Text>
              {profile.personal_bests.map((pb) => (
                <View key={pb.distance} style={styles.pbItem}>
                  <Text style={styles.pbDistance}>{pb.distance} km</Text>
                  <Text style={styles.pbTime}>{pb.time}</Text>
                  <Text style={styles.pbPace}>{pb.pace}/km</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'medaglie' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🏅 Le Tue Medaglie</Text>
              <Text style={styles.emptyText}>
                Completa corse per sbloccare medaglie! 🏃‍♂️
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'integratori' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>💊 Piano Integratori</Text>
              <Text style={styles.emptyText}>
                Piano personalizzato per recupero infortunio e performance.
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'esercizi' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>💪 Protocollo Rinforzo</Text>
              <Text style={styles.emptyText}>
                4x/settimana: esercizi di forza per prevenire infortuni.
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'test' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎯 Test Programmati</Text>
              <Text style={styles.emptyText}>
                Test ogni 4-6 settimane per monitorare i progressi VDOT.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
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
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.md,
  },
  tabBar: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabBarContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.accent,
  },
  tabLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  tabLabelActive: {
    color: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  tabContent: {
    paddingBottom: theme.spacing.xxl,
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
  stravaConnected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
  },
  stravaName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  stravaLocation: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  stravaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fc5200',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  stravaBadge: {
    width: 24,
    height: 24,
  },
  stravaButtonText: {
    color: '#fff',
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.md,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  syncButtonText: {
    color: theme.colors.background,
    fontWeight: theme.fontWeight.medium,
    fontSize: theme.fontSize.sm,
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  dataItem: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minWidth: '45%',
  },
  dataLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  dataValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  targetItem: {
    alignItems: 'center',
  },
  targetValue: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
  },
  targetLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  pbItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pbDistance: {
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  pbTime: {
    color: theme.colors.accent,
    fontWeight: theme.fontWeight.semibold,
  },
  pbPace: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    textAlign: 'center',
    padding: theme.spacing.xl,
  },
});
