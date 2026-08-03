import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, TYPOGRAPHY, SHADOW } from '../config';

interface Props {
  navigation: any;
}

const NUM_BARS = 24;

export default function RecordingScreen({ navigation }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [liveText, setLiveText] = useState('Tap Start Recording to begin...');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveAnims = useRef(
    Array.from({ length: NUM_BARS }, () => new Animated.Value(0.1)),
  ).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // Pulse ring animation
  useEffect(() => {
    if (isRecording && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.95, duration: 900, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording, isPaused, pulseAnim]);

  const startWave = () => {
    const animations = waveAnims.map((anim) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.random() * 0.8 + 0.1,
            duration: 150 + Math.random() * 200,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: Math.random() * 0.3 + 0.05,
            duration: 150 + Math.random() * 200,
            useNativeDriver: false,
          }),
        ]),
      ),
    );
    waveLoopRef.current = Animated.parallel(animations);
    waveLoopRef.current.start();
  };

  const stopWave = () => {
    waveLoopRef.current?.stop();
    waveAnims.forEach((a) => a.setValue(0.1));
  };

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      startWave();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (!isRecording) stopWave();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleStart = () => {
    setSeconds(0);
    setIsRecording(true);
    setIsPaused(false);
    setLiveText('Recording in progress...');
  };

  const handlePauseResume = () => {
    setIsPaused((p) => !p);
    if (!isPaused) {
      setLiveText('Recording paused.');
      stopWave();
    } else {
      setLiveText('Recording in progress...');
      startWave();
    }
  };

  const handleStopAndSave = () => {
    Alert.alert(
      'Recording Feature',
      'Live microphone recording requires the expo-audio native module. Please use the Upload tab to upload an existing audio file for transcription.',
      [
        { text: 'Go to Upload', onPress: () => navigation.navigate('UploadTab') },
        { text: 'OK', style: 'cancel' },
      ],
    );
    setIsRecording(false);
    setIsPaused(false);
    setSeconds(0);
    setLiveText('Tap Start Recording to begin...');
    stopWave();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Record Audio</Text>
        </View>
        {isRecording && (
          <View style={styles.recIndicator}>
            <Animated.View style={[styles.recDot, isPaused && styles.recDotPaused]} />
            <Text style={styles.recLabel}>{isPaused ? 'PAUSED' : 'REC'}</Text>
          </View>
        )}
      </View>

      {/* Scrollable Body — prevents button from being cut off */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Mic circle with pulse rings */}
        <View style={styles.micContainer}>
          <Animated.View style={[styles.pulseRingOuter, { transform: [{ scale: pulseAnim }] }]} />
          <Animated.View style={[styles.pulseRingInner, { transform: [{ scale: pulseAnim }] }]} />
          <View style={[styles.micCircle, SHADOW.card]}>
            <Ionicons
              name={isRecording ? 'mic' : 'mic-outline'}
              size={52}
              color={isRecording ? COLORS.primary : COLORS.outline}
            />
          </View>
        </View>

        {/* Timer */}
        <View style={styles.timerSection}>
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
          <Text style={styles.timerLabel}>ELAPSED TIME</Text>
        </View>

        {/* Waveform bars */}
        <View style={styles.waveformContainer}>
          {waveAnims.map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                styles.waveBar,
                {
                  height: anim.interpolate({ inputRange: [0, 1], outputRange: [4, 52] }),
                  backgroundColor: i % 3 === 0 ? COLORS.primary : `${COLORS.primary}55`,
                },
              ]}
            />
          ))}
        </View>

        {/* Live transcription card */}
        <View style={[styles.liveCard, SHADOW.card]}>
          <View style={styles.liveCardHeader}>
            <Ionicons name="sparkles" size={13} color={COLORS.secondary} />
            <Text style={styles.liveCardTitle}>LIVE TRANSCRIPTION (TWI)</Text>
          </View>
          <Text style={styles.liveCardText}>{liveText}</Text>
        </View>

        {/* Action controls */}
        {!isRecording ? (
          <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
            <Ionicons name="mic" size={22} color={COLORS.onPrimary} />
            <Text style={styles.startBtnLabel}>Start Recording</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.controlsBar}>
            <TouchableOpacity style={styles.controlBtn} onPress={handlePauseResume} activeOpacity={0.8}>
              <Ionicons name={isPaused ? 'play' : 'pause'} size={22} color={COLORS.onSurface} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.stopSaveBtn} onPress={handleStopAndSave} activeOpacity={0.85}>
              <Ionicons name="stop-circle" size={22} color={COLORS.onPrimary} />
              <Text style={styles.stopSaveLabel}>Stop & Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} activeOpacity={0.8}>
              <Ionicons name="bookmark-outline" size={22} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>
        )}

        {/* Info note */}
        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={15} color={COLORS.onSurfaceVariant} />
          <Text style={styles.noteText}>
            Live mic recording is coming soon. Use the{' '}
            <Text style={styles.noteBold}>Upload</Text> tab to transcribe existing audio files now.
          </Text>
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
    height: 56,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
  headerTitle: { ...TYPOGRAPHY.headlineSm, color: COLORS.onSurface },
  recIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error },
  recDotPaused: { backgroundColor: COLORS.outline },
  recLabel: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant, letterSpacing: 1.5 },

  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: SIZES.containerMargin,
    paddingTop: SIZES.lg,
    paddingBottom: SIZES.xl,
    gap: SIZES.md,
  },

  // Mic
  micContainer: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center' },
  pulseRingOuter: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: `${COLORS.primary}0D`,
  },
  pulseRingInner: {
    position: 'absolute', width: 144, height: 144, borderRadius: 72,
    backgroundColor: `${COLORS.primary}18`,
  },
  micCircle: {
    width: 116, height: 116, borderRadius: 58,
    backgroundColor: COLORS.surfaceContainerLowest,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: `${COLORS.outlineVariant}4D`,
  },

  // Timer
  timerSection: { alignItems: 'center' },
  timerText: { fontSize: 42, fontWeight: '700', color: COLORS.onBackground, letterSpacing: 2 },
  timerLabel: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant, letterSpacing: 2, marginTop: 2 },

  // Waveform
  waveformContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    height: 56, width: '100%',
  },
  waveBar: { flex: 1, borderRadius: 2 },

  // Live card
  liveCard: {
    width: '100%',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}33`,
  },
  liveCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  liveCardTitle: { ...TYPOGRAPHY.labelMd, color: COLORS.secondary },
  liveCardText: { ...TYPOGRAPHY.bodySm, color: COLORS.onSurface, fontStyle: 'italic', opacity: 0.65 },

  // Start button
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SIZES.sm,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusFull,
    paddingVertical: 16,
    width: '100%',
  },
  startBtnLabel: { ...TYPOGRAPHY.headlineSm, color: COLORS.onPrimary },

  // Recording controls
  controlsBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: `${COLORS.surfaceContainerHighest}CC`,
    borderRadius: SIZES.borderRadiusFull,
    padding: SIZES.sm, gap: SIZES.sm,
    width: '100%',
  },
  controlBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.surfaceContainerLowest,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: `${COLORS.outlineVariant}4D`,
  },
  stopSaveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SIZES.sm, height: 52,
    backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadiusFull,
  },
  stopSaveLabel: { ...TYPOGRAPHY.bodyMd, fontWeight: '700', color: COLORS.onPrimary },

  // Note card
  noteCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: SIZES.borderRadiusSm,
    padding: SIZES.md, width: '100%',
    borderWidth: 1, borderColor: `${COLORS.outlineVariant}33`,
  },
  noteText: { flex: 1, ...TYPOGRAPHY.bodySm, color: COLORS.onSurfaceVariant, lineHeight: 18 },
  noteBold: { fontWeight: '700', color: COLORS.primary },
});
