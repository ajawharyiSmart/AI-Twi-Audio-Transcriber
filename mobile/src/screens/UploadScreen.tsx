import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS, SIZES, TYPOGRAPHY, SHADOW } from '../config';
import { transcribeAudio } from '../services/api';

interface Props {
  navigation: any;
}

export default function UploadScreen({ navigation }: Props) {
  const [selectedFile, setSelectedFile] = useState<{
    uri: string; name: string; size: number; type: string;
  } | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'video/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      setSelectedFile({
        uri: asset.uri,
        name: asset.name,
        size: asset.size ?? 0,
        type: asset.mimeType ?? 'audio/mpeg',
      });

      // Scale feedback
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    } catch (err) {
      Alert.alert('Error', 'Failed to pick file. Please try again.');
    }
  };

  const handleTranscribe = async () => {
    if (!selectedFile) return;
    setIsTranscribing(true);

    try {
      const result = await transcribeAudio(
        { uri: selectedFile.uri, name: selectedFile.name, type: selectedFile.type },
        () => {},
      );
      setSelectedFile(null);
      // Navigate directly to Results — no need to go through Processing
      // since the API call is already complete
      navigation.navigate('Results', { result });
    } catch (err: any) {
      Alert.alert('Transcription Failed', err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.brandName}>HAKI</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Upload Audio</Text>
        <Text style={styles.pageSubtitle}>Transcribe Twi language recordings with AI precision.</Text>

        {/* Drop Zone */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.dropZone, SHADOW.tonal, selectedFile && styles.dropZoneDimmed]}
            onPress={pickFile}
            activeOpacity={0.8}
          >
            <View style={styles.dropIconCircle}>
              <Ionicons name="cloud-upload-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.dropTitle}>Tap to choose a file</Text>
            <Text style={styles.dropSubtitle}>MP3, WAV, M4A, MP4 up to 50 MB</Text>
            <View style={styles.chooseBtn}>
              <Text style={styles.chooseBtnLabel}>CHOOSE FILE</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Selected file info */}
        {selectedFile && (
          <View style={[styles.fileCard, SHADOW.card]}>
            <View style={styles.fileAccentBar} />
            <View style={styles.fileIconBox}>
              <Ionicons name="musical-notes" size={22} color={COLORS.primaryFixedDim} />
            </View>
            <View style={styles.fileInfo}>
              <View style={styles.fileNameRow}>
                <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                <TouchableOpacity onPress={() => setSelectedFile(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={18} color={COLORS.outline} />
                </TouchableOpacity>
              </View>
              <View style={styles.fileMeta}>
                <Ionicons name="folder-outline" size={14} color={COLORS.onSurfaceVariant} />
                <Text style={styles.fileMetaText}>{formatBytes(selectedFile.size)}</Text>
                <Ionicons name="musical-note-outline" size={14} color={COLORS.onSurfaceVariant} />
                <Text style={styles.fileMetaText}>{selectedFile.type.split('/')[1]?.toUpperCase() ?? 'AUDIO'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Transcribe button */}
        {selectedFile && (
          <TouchableOpacity
            style={[styles.transcribeBtn, isTranscribing && styles.transribeBtnDisabled]}
            onPress={handleTranscribe}
            disabled={isTranscribing}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={20} color={COLORS.onPrimary} />
            <Text style={styles.transribeBtnLabel}>
              {isTranscribing ? 'Processing...' : 'Start Transcription'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Tip card */}
        <View style={styles.tipCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.secondary} />
          <View style={styles.tipText}>
            <Text style={styles.tipTitle}>OPTIMIZED FOR TWI</Text>
            <Text style={styles.tipBody}>Our AI understands Twi cultural nuances and dialects.</Text>
          </View>
        </View>

        {/* Supported formats */}
        <View style={styles.formatsCard}>
          <Text style={styles.formatsTitle}>SUPPORTED FORMATS</Text>
          {[
            { icon: 'musical-note', label: 'MP3', desc: 'MPEG audio' },
            { icon: 'radio', label: 'WAV', desc: 'Waveform audio' },
            { icon: 'mic', label: 'M4A / AAC', desc: 'Apple audio' },
            { icon: 'videocam', label: 'MP4', desc: 'Video (audio extracted)' },
          ].map(({ icon, label, desc }) => (
            <View key={label} style={styles.formatRow}>
              <Ionicons name={icon as any} size={16} color={COLORS.primary} />
              <Text style={styles.formatLabel}>{label}</Text>
              <Text style={styles.formatDesc}>{desc}</Text>
            </View>
          ))}
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
    height: 64,
    backgroundColor: COLORS.surface,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { ...TYPOGRAPHY.headlineMd, color: COLORS.primary },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.containerMargin, paddingBottom: 100, paddingTop: SIZES.md },

  pageTitle: { ...TYPOGRAPHY.displayLg, color: COLORS.onBackground, marginBottom: SIZES.xs },
  pageSubtitle: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurfaceVariant, marginBottom: SIZES.lg },

  // Drop zone
  dropZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.outlineVariant,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.xl,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    marginBottom: SIZES.md,
  },
  dropZoneDimmed: { opacity: 0.55 },
  dropIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.md,
  },
  dropTitle: { ...TYPOGRAPHY.headlineSm, color: COLORS.onSurface, marginBottom: SIZES.xs },
  dropSubtitle: { ...TYPOGRAPHY.bodySm, color: COLORS.outline, marginBottom: SIZES.lg, textAlign: 'center' },
  chooseBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusSm,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
  },
  chooseBtnLabel: { ...TYPOGRAPHY.labelMd, color: COLORS.onPrimary, letterSpacing: 1 },

  // File card
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.md,
    gap: SIZES.md,
    marginBottom: SIZES.md,
    overflow: 'hidden',
  },
  fileAccentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: COLORS.primary },
  fileIconBox: {
    width: 48,
    height: 48,
    borderRadius: SIZES.borderRadiusSm,
    backgroundColor: COLORS.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: { flex: 1 },
  fileNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  fileName: { ...TYPOGRAPHY.bodyMd, fontWeight: '600', color: COLORS.onSurface, flex: 1, marginRight: SIZES.sm },
  fileMeta: { flexDirection: 'row', alignItems: 'center', gap: SIZES.xs },
  fileMetaText: { ...TYPOGRAPHY.bodySm, color: COLORS.onSurfaceVariant },

  // Transcribe button
  transcribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.xl,
    ...SHADOW.tonal,
  },
  transribeBtnDisabled: { opacity: 0.6 },
  transribeBtnLabel: { ...TYPOGRAPHY.headlineSm, color: COLORS.onPrimary },

  // Tip card
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.md,
    backgroundColor: `${COLORS.secondaryContainer}1A`,
    borderWidth: 1,
    borderColor: `${COLORS.secondary}33`,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
  },
  tipText: { flex: 1 },
  tipTitle: { ...TYPOGRAPHY.labelMd, color: COLORS.secondary },
  tipBody: { ...TYPOGRAPHY.bodySm, color: COLORS.onSurfaceVariant, marginTop: 2 },

  // Formats
  formatsCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.md,
  },
  formatsTitle: { ...TYPOGRAPHY.labelMd, color: COLORS.primary, marginBottom: SIZES.sm },
  formatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    paddingVertical: SIZES.xs,
  },
  formatLabel: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurface, width: 64 },
  formatDesc: { ...TYPOGRAPHY.bodySm, color: COLORS.onSurfaceVariant, flex: 1 },
});
