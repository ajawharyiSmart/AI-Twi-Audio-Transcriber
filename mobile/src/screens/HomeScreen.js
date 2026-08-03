import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  AppState,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import Card, { InfoCard } from '../components/Card';
import LoadingOverlay from '../components/LoadingOverlay';
import { transcribeAudio, checkHealth } from '../services/api';
import { saveRecentResult, saveHistory, loadHistory } from '../services/storage';
import { COLORS, SIZES } from '../config';

// Audio recording is temporarily unavailable in this build
const RECORDING_AVAILABLE = false;

export default function HomeScreen({ navigation }) {
  // File state
  const [selectedFile, setSelectedFile] = useState(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);

  // Transcription state
  const [transcribing, setTranscribing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [error, setError] = useState('');

  // Server health
  const [serverStatus, setServerStatus] = useState(null);

  // Check server health on mount
  useEffect(() => {
    checkServerHealth();
  }, []);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function checkServerHealth() {
    try {
      const health = await checkHealth();
      setServerStatus(health);
    } catch (err) {
      setServerStatus(null);
    }
  }

  async function startRecording() {
    Alert.alert(
      'Coming Soon',
      'Audio recording will be available in a future update. For now, please use the file upload option to select an audio file from your device.',
      [{ text: 'OK' }]
    );
  }

  async function stopRecording() {
    // Recording not available in this build
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }


  async function pickAudioFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'audio/*',
          'audio/mpeg',
          'audio/wav',
          'audio/ogg',
          'audio/mp4',
          'audio/m4a',
          'audio/x-m4a',
          'audio/aac',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'audio/mpeg',
          size: asset.size,
        });
        setError('');
      }
    } catch (err) {
      console.error('File picker error:', err);
      Alert.alert('Error', 'Failed to select audio file.');
    }
  }

  async function handleTranscribe() {
    if (!selectedFile) {
      setError('Please select or record an audio file first.');
      return;
    }

    setTranscribing(true);
    setError('');
    setProcessingStage('Uploading audio...');

    try {
      const result = await transcribeAudio(selectedFile, (progress) => {
        if (progress > 0 && progress < 100) {
          setProcessingStage('Processing audio...');
        }
      });

      // Refresh server health
      checkServerHealth();

      // Save result locally
      await saveRecentResult(result);

      // Update local history cache
      try {
        const localHistory = await loadHistory();
        localHistory.unshift({
          file_id: result.file_id,
          original_filename: selectedFile.name,
          transcription: result.text,
          translation: result.translation,
          language: result.language,
          created_at: new Date().toISOString(),
        });
        await saveHistory(localHistory);
      } catch (e) {
        console.error('Failed to cache history:', e);
      }

      setProcessingStage('');
      setTranscribing(false);
      setSelectedFile(null);

      // Navigate to results screen
      navigation.navigate('Results', { result });
    } catch (err) {
      setProcessingStage('');
      setTranscribing(false);
      setError(err.message || 'Failed to transcribe audio. Please try again.');
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function getFileSizeLabel(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="mic-circle" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>Haki</Text>
          <Text style={styles.headerSubtitle}>
            Transcribe Twi audio files with automatic English translation
          </Text>
        </View>

        {/* Server Status */}
        {serverStatus ? (
          <InfoCard
            type="success"
            title="Server Connected"
            message={`Models: ${serverStatus.custom_twi_model_loaded ? '✓ Twi' : '✗ Twi'} | ${serverStatus.translation_model_loaded ? '✓ Translation' : '✗ Translation'}`}
          />
        ) : (
          <InfoCard
            type="error"
            title="Server Unreachable"
            message="Please ensure the backend server is running on your computer."
          />
        )}

        {/* Model Info */}
        <Card>
          <View style={styles.modelInfoContainer}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} style={styles.modelInfoIcon} />
            <Text style={styles.modelInfoText}>
              <Text style={styles.modelInfoBold}>Custom Twi Model:</Text> Using a Whisper model specifically trained on Twi language data for improved accuracy with automatic English translation.
            </Text>
          </View>
        </Card>

        {/* Recording Section */}
        <Card title="Record Audio">
          <View style={styles.recordingSection}>
            {!isRecording ? (
              <Button
                title="Start Recording"
                onPress={startRecording}
                variant="outline"
                size="lg"
                icon={() => <Ionicons name="mic" size={20} color={COLORS.primary} />}
                disabled={transcribing}
                style={styles.recordingButton}
              />
            ) : (
              <Button
                title="Stop Recording"
                onPress={stopRecording}
                variant="destructive"
                size="lg"
                icon={() => <Ionicons name="stop" size={20} color={COLORS.white} />}
                style={styles.recordingButton}
              />
            )}

            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
              </View>
            )}
          </View>
        </Card>

        {/* File Upload Section */}
        <Card title="Upload Audio File">
          <TouchableOpacity
            style={styles.uploadArea}
            onPress={pickAudioFile}
            activeOpacity={0.7}
            disabled={isRecording || transcribing}
          >
            <Ionicons name="cloud-upload-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.uploadText}>
              {selectedFile ? selectedFile.name : 'Tap to select an audio file'}
            </Text>
            {selectedFile && selectedFile.size && (
              <Text style={styles.uploadSize}>{getFileSizeLabel(selectedFile.size)}</Text>
            )}
            {!selectedFile && (
              <Text style={styles.uploadHint}>Supports MP3, WAV, OGG, M4A, and more</Text>
            )}
          </TouchableOpacity>
        </Card>

        {/* Selected File Info */}
        {selectedFile && (
          <View style={styles.selectedFileInfo}>
            <Ionicons name="musical-note" size={20} color={COLORS.success} />
            <Text style={styles.selectedFileName} numberOfLines={1}>
              {selectedFile.name}
            </Text>
          </View>
        )}

        {/* Error Message */}
        {error ? (
          <InfoCard type="error" message={error} />
        ) : null}

        {/* Transcribe Button */}
        <Button
          title="Transcribe Audio"
          onPress={handleTranscribe}
          variant="primary"
          size="lg"
          disabled={!selectedFile || transcribing || isRecording}
          loading={transcribing}
          icon={() => <Ionicons name="text" size={20} color={COLORS.white} />}
          style={styles.transcribeButton}
        />

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Loading Overlay */}
      <LoadingOverlay visible={transcribing} stage={processingStage} />
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
    paddingTop: Platform.OS === 'ios' ? 60 : SIZES.padding,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.marginLarge,
  },
  headerIcon: {
    marginBottom: SIZES.base,
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modelInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  modelInfoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  modelInfoText: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
  modelInfoBold: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  recordingSection: {
    alignItems: 'center',
  },
  recordingButton: {
    width: '100%',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.margin,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.error,
    marginRight: 8,
  },
  recordingTime: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.error,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    borderRadius: SIZES.borderRadius,
    padding: SIZES.paddingLarge,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  uploadText: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.base,
    marginBottom: 4,
  },
  uploadSize: {
    fontSize: SIZES.small,
    color: COLORS.textTertiary,
  },
  uploadHint: {
    fontSize: SIZES.small,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 4,
  },
  selectedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadiusSm,
    marginBottom: SIZES.margin,
  },
  selectedFileName: {
    fontSize: SIZES.font,
    color: COLORS.success,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  transcribeButton: {
    marginTop: SIZES.base,
  },
});