import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../components/Button';
import Card from '../components/Card';
import { fetchHistory, deleteTranscription } from '../services/api';
import { loadHistory as loadLocalHistory, saveHistory as saveLocalHistory } from '../services/storage';
import { COLORS, SIZES } from '../config';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Fetch history whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadHistoryData();
    }, [])
  );

  async function loadHistoryData() {
    setError('');
    try {
      // Try to fetch from server first
      const serverHistory = await fetchHistory();
      setHistory(serverHistory);
      // Cache locally
      await saveLocalHistory(serverHistory);
    } catch (err) {
      // Fall back to local cache
      console.log('Server unavailable, loading local history:', err.message);
      try {
        const localHistory = await loadLocalHistory();
        if (localHistory && localHistory.length > 0) {
          setHistory(localHistory);
        } else {
          setError('Server unavailable. No cached history found.');
        }
      } catch (localErr) {
        setError('Failed to load history from any source.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    loadHistoryData();
  }

  async function handleDelete(item) {
    Alert.alert(
      'Delete Transcription',
      `Are you sure you want to delete the transcription for "${item.original_filename}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTranscription(item.file_id);
              // Remove from local state
              setHistory((prev) => prev.filter((h) => h.file_id !== item.file_id));
              // Update cache
              const updated = history.filter((h) => h.file_id !== item.file_id);
              await saveLocalHistory(updated);
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete transcription.');
            }
          },
        },
      ]
    );
  }

  function handleItemPress(item) {
    navigation.navigate('ResultsTab', {
      result: {
        text: item.transcription,
        translation: item.translation,
        language: item.language,
        file_id: item.file_id,
        created_at: item.created_at,
        model: 'custom_twi',
      },
    });
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      }
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  function renderHistoryItem({ item }) {
    const hasTranslation = item.translation && item.translation.length > 0;

    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.historyItemContent}>
          <View style={styles.historyItemHeader}>
            <Ionicons
              name="document-text"
              size={20}
              color={COLORS.primary}
              style={styles.historyItemIcon}
            />
            <View style={styles.historyItemInfo}>
              <Text style={styles.historyItemFilename} numberOfLines={1}>
                {item.original_filename}
              </Text>
              <View style={styles.historyItemMeta}>
                <Text style={styles.historyItemDate}>
                  {formatDate(item.created_at)}
                </Text>
                {item.language && (
                  <View style={styles.languageBadge}>
                    <Text style={styles.languageBadgeText}>
                      {item.language.toUpperCase()}
                    </Text>
                  </View>
                )}
                {hasTranslation && (
                  <View style={styles.translatedBadge}>
                    <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                    <Text style={styles.translatedBadgeText}>Translated</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Preview text */}
          {item.transcription && (
            <Text style={styles.historyItemPreview} numberOfLines={2}>
              {item.transcription}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  function renderEmptyState() {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={64} color={COLORS.textTertiary} />
        <Text style={styles.emptyTitle}>No History Yet</Text>
        <Text style={styles.emptySubtitle}>
          Your transcribed audio files will appear here.{'\n'}Start by transcribing your first audio file.
        </Text>
        <Button
          title="Go Transcribe"
          onPress={() => navigation.navigate('Home')}
          variant="primary"
          size="md"
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Error banner */}
      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={history}
        keyExtractor={(item) => item.file_id}
        renderItem={renderHistoryItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          history.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SIZES.margin,
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginTop: Platform.OS === 'ios' ? 60 : SIZES.padding,
    borderRadius: SIZES.borderRadiusSm,
  },
  errorText: {
    fontSize: SIZES.font,
    color: COLORS.error,
    marginLeft: 8,
    flex: 1,
  },
  listContent: {
    padding: SIZES.padding,
    paddingTop: Platform.OS === 'ios' ? 60 : SIZES.padding,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  historyItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusSm,
    padding: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyItemIcon: {
    marginRight: 10,
  },
  historyItemInfo: {
    flex: 1,
  },
  historyItemFilename: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  historyItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  historyItemDate: {
    fontSize: SIZES.small,
    color: COLORS.textTertiary,
    marginRight: 8,
  },
  languageBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
  },
  languageBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  translatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  translatedBadgeText: {
    fontSize: 10,
    color: COLORS.success,
    marginLeft: 2,
  },
  historyItemPreview: {
    fontSize: SIZES.small,
    color: COLORS.textTertiary,
    marginTop: 8,
    lineHeight: 18,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SIZES.paddingLarge,
  },
  emptyTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SIZES.margin,
  },
  emptySubtitle: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.base,
    marginBottom: SIZES.marginLarge,
    lineHeight: 22,
  },
});