import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { COLORS, SIZES, TYPOGRAPHY, SHADOW } from '../config';
import type { TranscriptionResult, HistoryItem } from '../services/api';

interface Props {
  navigation: any;
  route: { params: { result?: TranscriptionResult; item?: HistoryItem } };
}

export default function ResultsScreen({ navigation, route }: Props) {
  const { result, item } = route.params ?? {};

  const transcription = result?.text ?? item?.transcription ?? '';
  const translation = result?.translation ?? item?.translation ?? '';
  const language = result?.language ?? item?.language ?? 'tw';
  const fileName = item?.original_filename ?? 'Recording';

  const [copiedTwi, setCopiedTwi] = useState(false);
  const [copiedEn, setCopiedEn] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Mock waveform bars
  const WAVE_HEIGHTS = [8, 20, 36, 28, 44, 16, 40, 24, 48, 12, 30, 22, 14, 38, 18, 32, 10, 42, 26, 20];

  const handleCopy = async (text: string, lang: 'tw' | 'en') => {
    await Clipboard.setStringAsync(text);
    if (lang === 'tw') {
      setCopiedTwi(true);
      setTimeout(() => setCopiedTwi(false), 2000);
    } else {
      setCopiedEn(true);
      setTimeout(() => setCopiedEn(false), 2000);
    }
  };

  const handleShare = async () => {
    try {
      const content = `HAKI Transcription\n\nTwi Transcription:\n${transcription}\n\nEnglish Translation:\n${translation}`;
      const path = `${FileSystem.cacheDirectory}haki_transcription.txt`;
      await FileSystem.writeAsStringAsync(path, content);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(path, { mimeType: 'text/plain', dialogTitle: 'Share Transcription' });
      } else {
        await Clipboard.setStringAsync(content);
        Alert.alert('Copied', 'Transcription copied to clipboard.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to share transcription.');
    }
  };

  const handleExport = async () => {
    try {
      const content = `HAKI AI Transcription\nFile: ${fileName}\nLanguage: ${language.toUpperCase()}\n\n--- TWI TRANSCRIPTION ---\n${transcription}\n\n--- ENGLISH TRANSLATION ---\n${translation}`;
      const path = `${FileSystem.cacheDirectory}haki_export.txt`;
      await FileSystem.writeAsStringAsync(path, content);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(path, { mimeType: 'text/plain', dialogTitle: 'Export Transcription' });
      } else {
        Alert.alert('Saved', `Transcription saved to ${path}`);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to export transcription.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={styles.brandName}>HAKI</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.avatarSmall}>
            <Ionicons name="person" size={16} color={COLORS.onSurfaceVariant} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Audio Player Card */}
        <View style={[styles.playerCard, SHADOW.tonal]}>
          <View style={styles.playerFileRow}>
            <View style={styles.playerIconBox}>
              <Ionicons name="equalizer-outline" size={24} color={COLORS.onPrimaryContainer} />
            </View>
            <View style={styles.playerFileInfo}>
              <Text style={styles.playerFileName} numberOfLines={1}>{fileName}</Text>
              <Text style={styles.playerMeta}>Processed · {language.toUpperCase()}</Text>
            </View>
          </View>

          {/* Waveform */}
          <View style={styles.waveformRow}>
            {WAVE_HEIGHTS.map((h, i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    height: h,
                    backgroundColor: i < 10 ? COLORS.primary : COLORS.outlineVariant,
                    opacity: i < 10 ? 1 : 0.5,
                  },
                ]}
              />
            ))}
          </View>

          {/* Playback controls */}
          <View style={styles.playerControls}>
            <Text style={styles.playerTime}>00:00</Text>
            <View style={styles.playerButtons}>
              <TouchableOpacity>
                <Ionicons name="play-back-outline" size={22} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.playBtn}
                onPress={() => setIsPlaying((p) => !p)}
                activeOpacity={0.85}
              >
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color={COLORS.onPrimary} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="play-forward-outline" size={22} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.playerTime}>--:--</Text>
          </View>
        </View>

        {/* Twi Transcription Card */}
        <View style={[styles.textCard, SHADOW.card]}>
          <View style={[styles.textCardHeader, styles.twiHeader]}>
            <View style={styles.textCardTitleRow}>
              <Text style={styles.twiLabel}>TWI TRANSCRIPTION</Text>
              <View style={styles.accuracyChip}>
                <Text style={styles.accuracyChipText}>ACCURATE</Text>
              </View>
            </View>
            <View style={styles.textCardActions}>
              <TouchableOpacity
                style={styles.textActionBtn}
                onPress={() => handleCopy(transcription, 'tw')}
              >
                <Ionicons
                  name={copiedTwi ? 'checkmark-circle-outline' : 'copy-outline'}
                  size={14}
                  color={copiedTwi ? COLORS.secondary : COLORS.onSurfaceVariant}
                />
                <Text style={[styles.textActionLabel, copiedTwi && { color: COLORS.secondary }]}>
                  {copiedTwi ? 'Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.textActionBtn} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={14} color={COLORS.onSurfaceVariant} />
                <Text style={styles.textActionLabel}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.twiAccentBar} />
          <ScrollView style={styles.textScrollArea} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            <Text style={styles.transcriptionText}>
              {transcription || 'No Twi transcription available for this recording.'}
            </Text>
          </ScrollView>
        </View>

        {/* English Translation Card */}
        <View style={[styles.textCard, SHADOW.card]}>
          <View style={[styles.textCardHeader, styles.enHeader]}>
            <View style={styles.textCardTitleRow}>
              <Text style={styles.enLabel}>ENGLISH TRANSLATION</Text>
              <View style={styles.aiChip}>
                <Text style={styles.aiChipText}>AI POLISHED</Text>
              </View>
            </View>
            <View style={styles.textCardActions}>
              <TouchableOpacity
                style={styles.textActionBtn}
                onPress={() => handleCopy(translation, 'en')}
              >
                <Ionicons
                  name={copiedEn ? 'checkmark-circle-outline' : 'copy-outline'}
                  size={14}
                  color={copiedEn ? COLORS.secondary : COLORS.onSurfaceVariant}
                />
                <Text style={[styles.textActionLabel, copiedEn && { color: COLORS.secondary }]}>
                  {copiedEn ? 'Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.textActionBtn} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={14} color={COLORS.onSurfaceVariant} />
                <Text style={styles.textActionLabel}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.enAccentBar} />
          <ScrollView style={styles.textScrollArea} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            <Text style={styles.transcriptionText}>
              {translation || 'No English translation available for this recording.'}
            </Text>
          </ScrollView>
        </View>
      </ScrollView>

      {/* FAB: Export */}
      <TouchableOpacity style={styles.fab} onPress={handleExport} activeOpacity={0.85}>
        <Ionicons name="download-outline" size={22} color={COLORS.onSecondary} />
      </TouchableOpacity>
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  brandName: { ...TYPOGRAPHY.headlineMd, color: COLORS.primary },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.containerMargin, paddingBottom: 100, paddingTop: SIZES.md },

  // Player
  playerCard: {
    backgroundColor: `${COLORS.surfaceContainerLowest}B3`,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
  },
  playerFileRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md, marginBottom: SIZES.md },
  playerIconBox: {
    width: 48,
    height: 48,
    borderRadius: SIZES.borderRadiusSm,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerFileInfo: { flex: 1 },
  playerFileName: { ...TYPOGRAPHY.headlineSm, color: COLORS.onSurface, flex: 1 },
  playerMeta: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 48,
    marginBottom: SIZES.sm,
  },
  waveBar: { flex: 1, borderRadius: 2 },
  playerControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  playerTime: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant },
  playerButtons: { flexDirection: 'row', alignItems: 'center', gap: SIZES.xl },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
  },

  // Text cards
  textCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    overflow: 'hidden',
    marginBottom: SIZES.lg,
    maxHeight: 320,
  },
  textCardHeader: {
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  twiHeader: { backgroundColor: COLORS.surfaceContainerLow },
  enHeader: { backgroundColor: COLORS.surfaceContainerLow },
  textCardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, marginBottom: SIZES.xs },
  textCardActions: { flexDirection: 'row', gap: SIZES.sm },
  textActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SIZES.sm, paddingVertical: 4 },
  textActionLabel: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant },

  twiLabel: { ...TYPOGRAPHY.labelMd, color: COLORS.primary, letterSpacing: 1 },
  enLabel: { ...TYPOGRAPHY.labelMd, color: COLORS.tertiary, letterSpacing: 1 },
  accuracyChip: { backgroundColor: COLORS.primaryContainer, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  accuracyChipText: { fontSize: 10, fontWeight: '700', color: COLORS.onPrimaryContainer },
  aiChip: { backgroundColor: COLORS.secondaryContainer, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  aiChipText: { fontSize: 10, fontWeight: '700', color: COLORS.onSecondaryContainer },

  twiAccentBar: { height: 0, borderLeftWidth: 4, borderLeftColor: COLORS.outline },
  enAccentBar: { height: 0, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  textScrollArea: { padding: SIZES.md, backgroundColor: COLORS.surfaceContainerLowest },
  transcriptionText: { ...TYPOGRAPHY.transcriptionText, color: COLORS.onSurface },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 90,
    right: SIZES.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.tonal,
  },
});
