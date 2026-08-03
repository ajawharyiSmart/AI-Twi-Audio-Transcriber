import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, TYPOGRAPHY, SHADOW } from '../config';

interface Props {
  route: { params: { fileName?: string } };
}

const STEPS = [
  { icon: 'cloud-upload-outline', label: 'Uploading Audio' },
  { icon: 'pulse-outline', label: 'Processing Speech' },
  { icon: 'text-outline', label: 'Generating Twi Transcript' },
  { icon: 'language-outline', label: 'Translating to English' },
  { icon: 'document-text-outline', label: 'Preparing Results' },
];

export default function ProcessingScreen({ route }: Props) {
  const fileName = route.params?.fileName ?? 'Audio File';

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(12);

  const progressAnim = useRef(new Animated.Value(12)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const dotAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  // Spin animation for active step icon
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
    ).start();
  }, [spinAnim]);

  // Shimmer on card
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();
  }, [shimmerAnim]);

  // Dot bounce for active step
  useEffect(() => {
    dotAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(anim, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ).start();
    });
  }, []);

  // Advance steps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((s) => {
        const next = Math.min(s + 1, STEPS.length - 1);
        return next;
      });
      setProgress((p) => Math.min(p + 18, 95));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const shimmerOpacity = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] });

  // SVG circle math
  const RADIUS = 80;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

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
        <TouchableOpacityStub />
      </View>

      <View style={styles.body}>
        {/* Circular progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressCircleWrapper}>
            {/* SVG-like circle using borders */}
            <View style={styles.trackCircle} />
            <Animated.View
              style={[
                styles.progressOverlay,
                { transform: [{ rotate: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['-90deg', '270deg'] }) }] },
              ]}
            />

            <View style={styles.progressCenter}>
              <Text style={styles.progressPct}>{progress}%</Text>
              <Text style={styles.progressLabelSm}>PROCESSING</Text>
            </View>
          </View>

          {/* Floating sparkle */}
          <View style={styles.sparkle}>
            <Ionicons name="sparkles" size={20} color={COLORS.onSecondaryContainer} />
          </View>
        </View>

        {/* Status */}
        <Text style={styles.statusTitle}>Transcribing Twi Speech</Text>
        <Text style={styles.statusSubtitle}>
          Please stay on this screen. HAKI is processing{'\n'}the cultural nuances of your audio.
        </Text>

        {/* Steps card */}
        <View style={[styles.stepsCard, SHADOW.card]}>
          <Animated.View style={[styles.shimmerOverlay, { opacity: shimmerOpacity }]} />
          {STEPS.map((step, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <View key={i} style={styles.stepRow}>
                <View style={[styles.stepIcon, done && styles.stepIconDone, active && styles.stepIconActive]}>
                  {done ? (
                    <Ionicons name="checkmark" size={14} color={COLORS.secondary} />
                  ) : active ? (
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Ionicons name={step.icon as any} size={14} color={COLORS.onPrimaryContainer} />
                    </Animated.View>
                  ) : (
                    <Ionicons name={step.icon as any} size={14} color={COLORS.outline} />
                  )}
                </View>
                <View style={styles.stepLabelContainer}>
                  <Text style={[
                    styles.stepLabel,
                    done && styles.stepLabelDone,
                    active && styles.stepLabelActive,
                    !done && !active && styles.stepLabelPending,
                  ]}>
                    {step.label}
                  </Text>
                </View>
                {done ? (
                  <Text style={styles.stepDoneText}>Done</Text>
                ) : active ? (
                  <View style={styles.dotsRow}>
                    {dotAnims.map((anim, di) => (
                      <Animated.View
                        key={di}
                        style={[styles.dot, { transform: [{ translateY: anim }] }]}
                      />
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* Tip */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={18} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>PRO TIP</Text>
            <Text style={styles.tipBody}>
              HAKI's AI handles local Accra dialects and idioms for more accurate translations.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Placeholder to avoid importing TouchableOpacity just for the notification icon
function TouchableOpacityStub() {
  return (
    <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="notifications-outline" size={22} color={COLORS.onSurfaceVariant} />
    </View>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { ...TYPOGRAPHY.headlineMd, color: COLORS.primary },

  body: { flex: 1, alignItems: 'center', paddingHorizontal: SIZES.containerMargin, paddingTop: SIZES.lg, paddingBottom: SIZES.xl },

  // Progress circle (CSS-based approximation)
  progressContainer: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center', marginBottom: SIZES.lg },
  progressCircleWrapper: {
    width: 192,
    height: 192,
    borderRadius: 96,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  trackCircle: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
    borderWidth: 10,
    borderColor: COLORS.surfaceContainerHigh,
  },
  progressOverlay: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
    borderWidth: 10,
    borderColor: 'transparent',
    borderTopColor: COLORS.primary,
    borderRightColor: COLORS.primary,
  },
  progressCenter: { alignItems: 'center' },
  progressPct: { ...TYPOGRAPHY.displayLg, color: COLORS.primary },
  progressLabelSm: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant, letterSpacing: 1.5 },
  sparkle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
  },

  statusTitle: { ...TYPOGRAPHY.headlineSm, color: COLORS.onSurface, textAlign: 'center', marginBottom: SIZES.xs },
  statusSubtitle: { ...TYPOGRAPHY.bodySm, color: COLORS.onSurfaceVariant, textAlign: 'center', marginBottom: SIZES.lg },

  // Steps
  stepsCard: {
    width: '100%',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: `${COLORS.outlineVariant}33`,
    gap: SIZES.lg,
    marginBottom: SIZES.xl,
    overflow: 'hidden',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: `${COLORS.primary}0D`,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepIconDone: { backgroundColor: COLORS.secondaryContainer },
  stepIconActive: { backgroundColor: COLORS.primaryContainer },
  stepLabelContainer: { flex: 1 },
  stepLabel: { ...TYPOGRAPHY.bodyMd },
  stepLabelDone: { color: COLORS.secondary, fontWeight: '600' },
  stepLabelActive: { color: COLORS.primary, fontWeight: '700' },
  stepLabelPending: { color: COLORS.onSurfaceVariant, opacity: 0.5 },
  stepDoneText: { ...TYPOGRAPHY.labelMd, color: COLORS.secondary, opacity: 0.7 },
  dotsRow: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.primary },

  // Tip
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.md,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: `${COLORS.primary}1A`,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.md,
    width: '100%',
  },
  tipTitle: { ...TYPOGRAPHY.labelMd, color: COLORS.primary },
  tipBody: { ...TYPOGRAPHY.bodySm, color: COLORS.onSurfaceVariant, marginTop: 2 },
});
