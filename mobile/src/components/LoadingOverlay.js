import React from 'react';
import { View, Text, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../config';

/**
 * Full-screen loading overlay with stage indicator.
 *
 * @param {object} props
 * @param {boolean} props.visible - Show/hide overlay
 * @param {string} props.stage - Current processing stage description
 */
export default function LoadingOverlay({ visible, stage }) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          {stage && (
            <Text style={styles.stage}>{stage}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.paddingLarge,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  stage: {
    marginTop: SIZES.margin,
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});