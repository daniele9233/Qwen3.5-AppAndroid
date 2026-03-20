import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { api } from '@/src/api';

export default function Badges() {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const data = await api.get('/badges');
      setBadges(data || []);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'milestone', name: '🏃‍♂️ Milestone', icon: '🏃‍♂️' },
    { id: 'consistency', name: '📅 Costanza', icon: '📅' },
    { id: 'improvement', name: '📈 Miglioramenti', icon: '📈' },
    { id: 'training', name: '🏋️ Allenamento', icon: '🏋️' },
    { id: 'halfmarathon', name: '🎯 Mezza Maratona', icon: '🎯' },
    { id: 'science', name: '🧠 Scienza', icon: '🧠' },
    { id: 'speed', name: '💨 Velocità', icon: '💨' },
    { id: 'fun', name: '🎉 Fun & Speciali', icon: '🎉' },
  ];

  const getBadgeLevelStyle = (level: string) => {
    const styles_map: Record<string, { color: string; label: string }> = {
      warmup: { color: '#71717a', label: 'Warm-up' },
      bronze: { color: '#cd7f32', label: 'Bronzo' },
      silver: { color: '#c0c0c0', label: 'Argento' },
      gold: { color: '#ffd700', label: 'Oro' },
      platinum: { color: '#e5e4e2', label: 'Platino' },
      elite: { color: '#bef264', label: 'Elite' },
    };
    return styles_map[level] || styles_map.warmup;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Ionicons name="loader" size={32} color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Badge e Trofei</Text>

      {/* Progress Overview */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewRow}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{badges.filter(b => b.unlocked).length}</Text>
            <Text style={styles.overviewLabel}>Sbloccati</Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{badges.length}</Text>
            <Text style={styles.overviewLabel}>Totali</Text>
          </View>
        </View>
      </View>

      {/* Categories */}
      {categories.map((category) => {
        const categoryBadges = badges.filter((b: any) => b.category === category.id);
        const unlockedCount = categoryBadges.filter((b: any) => b.unlocked).length;
        const isExpanded = expandedCategory === category.id;

        return (
          <View key={category.id} style={styles.categoryCard}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => setExpandedCategory(isExpanded ? null : category.id)}
            >
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>
                  {unlockedCount}/{categoryBadges.length} sbloccati
                </Text>
              </View>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.badgesGrid}>
                {categoryBadges.map((badge: any) => {
                  const levelStyle = getBadgeLevelStyle(badge.level);
                  
                  return (
                    <View
                      key={badge.id}
                      style={[
                        styles.badgeItem,
                        { opacity: badge.unlocked ? 1 : 0.5 }
                      ]}
                    >
                      <View
                        style={[
                          styles.badgeIcon,
                          { backgroundColor: badge.unlocked ? levelStyle.color : theme.colors.border }
                        ]}
                      >
                        <Text style={styles.badgeEmoji}>{badge.icon || '🏅'}</Text>
                      </View>
                      <Text style={styles.badgeName} numberOfLines={2}>
                        {badge.name}
                      </Text>
                      {badge.unlocked && (
                        <Text style={styles.badgeLevel}>{levelStyle.label}</Text>
                      )}
                      {badge.unlocked && badge.date && (
                        <Text style={styles.badgeDate}>
                          {new Date(badge.date).toLocaleDateString('it-IT')}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
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
  overviewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewValue: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
  },
  overviewLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  overviewDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  categoryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  categoryCount: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.md,
    paddingTop: 0,
    gap: theme.spacing.sm,
  },
  badgeItem: {
    width: '30%',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  badgeEmoji: {
    fontSize: theme.fontSize.xxl,
  },
  badgeName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xs,
    textAlign: 'center',
    height: 32,
  },
  badgeLevel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
  badgeDate: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
});
