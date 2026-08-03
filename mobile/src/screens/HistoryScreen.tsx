import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES, TYPOGRAPHY, SHADOW } from '../config';
import { fetchHistory, deleteTranscription, HistoryItem } from '../services/api';

interface Props {
  navigation: any;
}

type FilterKey = 'all' | 'completed' | 'archived';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Transcribed' },
  { key: 'archived', label: 'Archived' },
];

export default function HistoryScreen({ navigation }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const loadHistory = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchHistory();
      setItems(data);
    } catch {
      // Backend may not be running
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadHistory(); }, [loadHistory]));

  const handleDelete = (fileId: string, name: string) => {
    Alert.alert(
      'Delete Recording',
      `Delete "${name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTranscription(fileId);
              setItems((prev) => prev.filter((i) => i.file_id !== fileId));
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ],
    );
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return '—'; }
  };

  const getDaysLeft = (iso: string) => {
    try {
      const diff = new Date(iso).getTime() - Date.now();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    } catch { return null; }
  };

  const isExpired = (iso: string) => {
    try {
      return new Date(iso).getTime() <= Date.now();
    } catch {
      return false;
    }
  };

  const filtered = items.filter((it) => {
    const matchSearch = search.length === 0 ||
      it.original_filename?.toLowerCase().includes(search.toLowerCase()) ||
      it.transcription?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'completed') return Boolean(it.transcription?.trim());
    if (filter === 'archived') return isExpired(it.audio_expires_at);
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={18} color={COLORS.onPrimaryContainer} />
          </View>
          <Text style={styles.brandName}>HAKI</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadHistory(true)} tintColor={COLORS.primary} />}
      >
        {/* Search */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color={COLORS.outline} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transcriptions..."
            placeholderTextColor={COLORS.outline}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.outline} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterRowContent}
        >
          {FILTERS.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, filter === key && styles.filterChipActive]}
              onPress={() => setFilter(key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipLabel, filter === key && styles.filterChipLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={COLORS.primary} size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="folder-open-outline" size={56} color={COLORS.outline} style={{ opacity: 0.4 }} />
            <Text style={styles.emptyTitle}>No recordings yet</Text>
            <Text style={styles.emptySubtitle}>
              {search ? 'No results match your search.' : 'Transcriptions will appear here after recording or uploading audio.'}
            </Text>
          </View>
        ) : (
          filtered.map((item) => {
            const daysLeft = getDaysLeft(item.audio_expires_at);
            const urgent = daysLeft !== null && daysLeft <= 7;
            return (
              <TouchableOpacity
                key={item.file_id}
                style={[styles.card, SHADOW.card]}
                onPress={() => navigation.navigate('Results', { result: {
                  text: item.transcription,
                  translation: item.translation,
                  language: item.language,
                  model: 'custom_twi',
                  file_id: item.file_id,
                }, item })}
                activeOpacity={0.85}
              >
                <View style={styles.cardAccent} />
                <View style={styles.cardBody}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardTitleBlock}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.original_filename || 'Untitled Recording'}
                      </Text>
                      <Text style={styles.cardDate}>
                        {formatDate(item.created_at)}
                      </Text>
                    </View>
                    <View style={styles.completedChip}>
                      <Text style={styles.completedChipText}>DONE</Text>
                    </View>
                  </View>

                  {/* Transcription snippet */}
                  {item.transcription ? (
                    <Text style={styles.snippet} numberOfLines={2}>{item.transcription}</Text>
                  ) : null}

                  <View style={styles.cardBottomRow}>
                    <View style={styles.cardMeta}>
                      <Ionicons name="language-outline" size={12} color={COLORS.onSurfaceVariant} />
                      <Text style={styles.metaText}>{item.language?.toUpperCase() || 'TW'}</Text>
                    </View>
                    {daysLeft !== null && (
                      <View style={[styles.expiryBadge, urgent && styles.expiryBadgeUrgent]}>
                        <Ionicons
                          name="timer-outline"
                          size={12}
                          color={urgent ? COLORS.error : COLORS.onSurfaceVariant}
                        />
                        <Text style={[styles.expiryText, urgent && styles.expiryTextUrgent]}>
                          {daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(item.file_id, item.original_filename)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}

        {/* End indicator */}
        {filtered.length > 0 && (
          <View style={styles.endIndicator}>
            <Ionicons name="archive-outline" size={32} color={COLORS.outline} style={{ opacity: 0.3 }} />
            <Text style={styles.endText}>End of history</Text>
          </View>
        )}
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
    height: 64,
    backgroundColor: COLORS.surface,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandName: { ...TYPOGRAPHY.headlineMd, color: COLORS.primary },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.containerMargin, paddingBottom: 100, paddingTop: SIZES.md },

  // Search
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.md,
    gap: SIZES.sm,
    marginBottom: SIZES.lg,
  },
  searchIcon: {},
  searchInput: { ...TYPOGRAPHY.bodyMd, flex: 1, color: COLORS.onSurface },

  // Filters
  filterRow: { marginBottom: SIZES.lg },
  filterRowContent: { gap: SIZES.sm, paddingRight: SIZES.md },
  filterChip: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: SIZES.borderRadiusFull,
  },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterChipLabel: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant },
  filterChipLabelActive: { color: COLORS.onPrimary },

  // States
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: SIZES.sm },
  emptyTitle: { ...TYPOGRAPHY.headlineSm, color: COLORS.onSurface },
  emptySubtitle: { ...TYPOGRAPHY.bodySm, color: COLORS.onSurfaceVariant, textAlign: 'center', paddingHorizontal: SIZES.xl },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    overflow: 'hidden',
    gap: SIZES.sm,
  },
  cardAccent: { width: 3, alignSelf: 'stretch', borderRadius: 2, backgroundColor: COLORS.primary, flexShrink: 0 },
  cardBody: { flex: 1 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SIZES.xs },
  cardTitleBlock: { flex: 1, marginRight: SIZES.sm },
  cardTitle: { ...TYPOGRAPHY.bodyMd, fontWeight: '600', color: COLORS.onSurface },
  cardDate: { ...TYPOGRAPHY.labelMd, color: COLORS.outline, marginTop: 2 },
  completedChip: {
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: SIZES.borderRadiusFull,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
  },
  completedChipText: { fontSize: 9, fontWeight: '700', color: COLORS.onSecondaryContainer, letterSpacing: 0.5 },
  snippet: { ...TYPOGRAPHY.bodySm, color: COLORS.onSurfaceVariant, marginBottom: SIZES.sm },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant },
  expiryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expiryBadgeUrgent: {
    backgroundColor: `${COLORS.error}0D`,
    borderRadius: SIZES.borderRadiusSm,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
  },
  expiryText: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant },
  expiryTextUrgent: { color: COLORS.error, fontWeight: '800' },

  // End
  endIndicator: { alignItems: 'center', paddingTop: SIZES.xl, gap: SIZES.sm },
  endText: { ...TYPOGRAPHY.labelMd, color: COLORS.outline, opacity: 0.5 },

  // Delete button
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: `${COLORS.error}10`,
    flexShrink: 0,
  },
});
