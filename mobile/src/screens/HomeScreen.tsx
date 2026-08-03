import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES, TYPOGRAPHY, SHADOW } from '../config';
import { fetchHistory, HistoryItem } from '../services/api';

interface Props {
  navigation: any;
}

export default function HomeScreen({ navigation }: Props) {
  const [recentItems, setRecentItems] = useState<HistoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  // Shimmer animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  const loadHistory = useCallback(async () => {
    try {
      const data = await fetchHistory();
      setRecentItems(data.slice(0, 3));
      setTotalCount(data.length);
    } catch {
      // silently ignore — backend may not be running yet
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadHistory(); }, [loadHistory]));

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return '—'; }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Top App Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={20} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.greetingLabel}>Hello, User</Text>
            <Text style={styles.brandName}>HAKI</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero AI Card */}
        <View style={[styles.heroCard, SHADOW.tonal]}>
          <Animated.View style={[styles.shimmerBar, { opacity: shimmerOpacity }]} />
          <Text style={styles.heroTitle}>Start Transcription</Text>
          <Text style={styles.heroSubtitle}>Capture speech with AI precision in Twi or English.</Text>

          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.recordBtn}
              onPress={() => {
                navigation.navigate('Recording');
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="mic" size={28} color={COLORS.onPrimary} />
              <Text style={styles.recordBtnLabel}>Record Audio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => {
                const parent = navigation.getParent?.();
                (parent ?? navigation).navigate('UploadTab');
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="cloud-upload-outline" size={28} color={COLORS.primary} />
              <Text style={styles.uploadBtnLabel}>Upload Audio</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Recordings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Recordings</Text>
            <TouchableOpacity onPress={() => {
              const parent = navigation.getParent?.();
              (parent ?? navigation).navigate('HistoryTab');
            }}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : recentItems.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="mic-circle-outline" size={40} color={COLORS.outline} />
              <Text style={styles.emptyText}>No recordings yet</Text>
              <Text style={styles.emptySubtext}>Record or upload audio to get started</Text>
            </View>
          ) : (
            recentItems.map((item, idx) => (
              <TouchableOpacity
                key={item.file_id}
                style={[styles.recordingCard, SHADOW.card]}
                onPress={() => navigation.navigate('Results', {
                  result: {
                    text: item.transcription,
                    translation: item.translation,
                    language: item.language,
                    model: 'custom_twi',
                    file_id: item.file_id,
                  },
                  item,
                })}
                activeOpacity={0.8}
              >
                <View style={[styles.accentBar, { backgroundColor: idx % 2 === 0 ? COLORS.primary : COLORS.tertiary }]} />
                <View style={styles.recordingInfo}>
                  <Text style={styles.recordingTitle} numberOfLines={1}>
                    {item.original_filename || `Recording ${idx + 1}`}
                  </Text>
                  <View style={styles.recordingMeta}>
                    <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
                    <View style={styles.metaDot} />
                    <Text style={styles.metaText}>{item.language?.toUpperCase() || 'TWI'}</Text>
                  </View>
                </View>
                <View style={styles.recordingRight}>
                  <View style={styles.statusChip}>
                    <Text style={styles.statusChipText}>DONE</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.outline} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Stats Bento */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardHighest, SHADOW.card]}>
            <Ionicons name="analytics-outline" size={22} color={COLORS.primary} />
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>TOTAL TRANSCRIPTS</Text>
          </View>
          <View style={[styles.statCard, styles.statCardHigh, SHADOW.card]}>
            <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.secondary} />
            <Text style={[styles.statNumber, { color: COLORS.secondary }]}>Twi</Text>
            <Text style={styles.statLabel}>ACTIVE LANGUAGE</Text>
          </View>
        </View>

        {/* Twi info card */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.secondary} />
          <View style={styles.infoCardText}>
            <Text style={styles.infoCardTitle}>OPTIMIZED FOR TWI</Text>
            <Text style={styles.infoCardBody}>Our AI understands Twi cultural nuances and dialects for more accurate results.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.containerMargin,
    paddingVertical: SIZES.sm,
    height: 64,
    backgroundColor: COLORS.surface,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingLabel: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant },
  brandName: { ...TYPOGRAPHY.headlineMd, color: COLORS.primary },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.containerMargin, paddingBottom: 100 },

  // Hero card
  heroCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: SIZES.lg,
    marginTop: SIZES.md,
    overflow: 'hidden',
  },
  shimmerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: 2,
  },
  heroTitle: { ...TYPOGRAPHY.headlineSm, color: COLORS.onSurface, marginBottom: SIZES.xs },
  heroSubtitle: { ...TYPOGRAPHY.bodySm, color: COLORS.onSurfaceVariant, marginBottom: SIZES.md },
  heroActions: { flexDirection: 'row', gap: SIZES.md },
  recordBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusSm,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    gap: SIZES.xs,
  },
  recordBtnLabel: { ...TYPOGRAPHY.labelMd, color: COLORS.onPrimary },
  uploadBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: SIZES.borderRadiusSm,
    borderWidth: 1,
    borderColor: `${COLORS.primary}33`,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    gap: SIZES.xs,
  },
  uploadBtnLabel: { ...TYPOGRAPHY.labelMd, color: COLORS.primary },

  // Section
  section: { marginTop: SIZES.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  sectionTitle: { ...TYPOGRAPHY.headlineSm, color: COLORS.onSurface },
  seeAll: { ...TYPOGRAPHY.labelMd, color: COLORS.primary },

  loadingBox: { height: 80, alignItems: 'center', justifyContent: 'center' },
  emptyBox: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: SIZES.xl,
    alignItems: 'center',
    gap: SIZES.sm,
  },
  emptyText: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface, fontWeight: '600' },
  emptySubtext: { ...TYPOGRAPHY.bodySm, color: COLORS.onSurfaceVariant, textAlign: 'center' },

  // Recording card
  recordingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}80`,
    padding: SIZES.md,
    marginBottom: SIZES.gutter,
    overflow: 'hidden',
  },
  accentBar: { width: 3, height: 48, borderRadius: 2 },
  recordingInfo: { flex: 1 },
  recordingTitle: { ...TYPOGRAPHY.bodyMd, fontWeight: '600', color: COLORS.onSurface },
  recordingMeta: { flexDirection: 'row', alignItems: 'center', gap: SIZES.xs, marginTop: 2 },
  metaText: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.outlineVariant },
  recordingRight: { flexDirection: 'column', alignItems: 'flex-end', gap: SIZES.xs },
  statusChip: {
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: SIZES.borderRadiusFull,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
  },
  statusChipText: { fontSize: 10, fontWeight: '700', color: COLORS.onSecondaryContainer, letterSpacing: 0.5 },

  // Stats
  statsRow: { flexDirection: 'row', gap: SIZES.md, marginTop: SIZES.lg },
  statCard: {
    flex: 1,
    padding: SIZES.md,
    borderRadius: SIZES.borderRadius,
    height: 128,
    justifyContent: 'space-between',
  },
  statCardHighest: { backgroundColor: COLORS.surfaceContainerHighest },
  statCardHigh: { backgroundColor: COLORS.surfaceContainerHigh },
  statNumber: { ...TYPOGRAPHY.displayLg, color: COLORS.onSurface },
  statLabel: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant },

  // Info card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.md,
    backgroundColor: `${COLORS.secondaryContainer}1A`,
    borderWidth: 1,
    borderColor: `${COLORS.secondaryContainer}33`,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.md,
    marginTop: SIZES.md,
  },
  infoCardText: { flex: 1 },
  infoCardTitle: { ...TYPOGRAPHY.labelMd, color: COLORS.secondary },
  infoCardBody: { ...TYPOGRAPHY.bodySm, color: COLORS.onSurfaceVariant, marginTop: 2 },
});
