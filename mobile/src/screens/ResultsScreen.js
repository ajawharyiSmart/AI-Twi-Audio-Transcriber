import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import Card, { InfoCard } from '../components/Card';
import { COLORS, SIZES } from '../config';

export default function ResultsScreen({ route, navigation }) {
  const { result } = route.params || {};

  if (!result) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color={COLORS.textTertiary} />
        <Text style={styles.emptyText}>No transcription result available.</Text>
        <Button
          title="Go Home"
          onPress={() => navigation.navigate('Home')}
          variant="outline"
        />
      </View>
    );
  }

  const {
    text: transcription,
    translation,
    language,
    file_id,
  } = result;

  async function handleDownload() {
    try {
      let content = `Twi Transcription:\n${transcription}\n\n`;
      if (translation) {
        content += `English Translation:\n${translation}`;
      }

      const fileName = `transcription_${file_id || Date.now()}.txt`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/plain',
          dialogTitle: 'Share Transcription',
        });
      } else {
        Alert.alert(
          'Saved',
          `Transcription saved to: ${filePath}`,
        );
      }
    } catch (err) {
      console.error('Download failed:', err);
      Alert.alert('Error', 'Failed to save transcription.');
    }
  }

  async function handleCopy() {
    try {
      let content = `Twi Transcription:\n${transcription}\n\n`;
      if (translation) {
        content += `English Translation:\n${translation}`;
      }
      await Clipboard.setStringAsync(content);
      Alert.alert('Copied', 'Transcription copied to clipboard.');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Header */}
        <View style={styles.statusHeader}>
          <View style={styles.statusIconContainer}>
            <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>Transcription Complete</Text>
            {result.created_at && (
              <Text style={styles.statusDate}>{formatDate(result.created_at)}</Text>
            )}
          </View>
        </View>

        {/* Detected Language */}
        {language && (
          <Card>
            <View style={styles.languageRow}>
              <Ionicons name="language" size={20} color={COLORS.primary} />
              <Text style={styles.languageText}>
                Detected Language:{' '}
                <Text style={styles.languageCode}>{language.toUpperCase()}</Text>
              </Text>
            </View>
          </Card>
        )}

        {/* Twi Transcription */}
        <Card title="Twi Transcription">
          <View style={styles.transcriptionBox}>
            <Text style={styles.transcriptionText} selectable>
              {transcription || 'No transcription available.'}
            </Text>
          </View>
        </Card>

        {/* English Translation */}
        {translation ? (
          <Card title="English Translation">
            <View style={styles.translationBox}>
              <Text style={styles.translationText} selectable>
                {translation}
              </Text>
            </View>
          </Card>
        ) : (
          <InfoCard
            type="info"
            title="Translation"
            message="No English translation was generated for this transcription."
          />
        )}

        {/* Model Info */}
        {result.model && (
          <InfoCard
            type="info"
            title="Model Used"
            message={`${result.model === 'custom_twi' ? 'Custom Twi Whisper Model' : result.model}`}
          />
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Share / Save"
            onPress={handleDownload}
            variant="primary"
            size="lg"
            icon={() => <Ionicons name="download-outline" size={20} color={COLORS.white} />}
            style={styles.actionButton}
          />
          <Button
            title="Copy to Clipboard"
            onPress={handleCopy}
            variant="outline"
            size="lg"
            icon={() => <Ionicons name="copy-outline" size={20} color={COLORS.primary} />}
            style={styles.actionButton}
          />
          <Button
            title="New Transcription"
            onPress={() => navigation.navigate('Home')}
            variant="ghost"
            size="lg"
            icon={() => <Ionicons name="mic-outline" size={20} color={COLORS.primary} />}
            style={styles.actionButton}
          />
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingTop: Platform.OS === 'ios' ? 20 : SIZES.padding,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.paddingLarge,
    backgroundColor: COLORS.background,
  },
  emptyText: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.margin,
    marginBottom: SIZES.marginLarge,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  statusIconContainer: {
    marginRight: SIZES.margin,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: SIZES.large,
    fontWeight: '700',
    color: COLORS.success,
  },
  statusDate: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  languageCode: {
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  transcriptionBox: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadiusSm,
    padding: SIZES.padding,
    minHeight: 100,
  },
  transcriptionText: {
    fontSize: SIZES.medium,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  translationBox: {
    backgroundColor: COLORS.successLight,
    borderRadius: SIZES.borderRadiusSm,
    padding: SIZES.padding,
    minHeight: 80,
  },
  translationText: {
    fontSize: SIZES.medium,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  actions: {
    marginTop: SIZES.margin,
  },
  actionButton: {
    marginBottom: SIZES.base,
  },
});