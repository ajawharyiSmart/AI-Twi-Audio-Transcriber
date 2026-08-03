import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../config';

/**
 * Reusable Card component with Header, Content, and optional Footer.
 *
 * @param {object} props
 * @param {string} props.title - Card title displayed in header
 * @param {React.ReactNode} props.children - Card content
 * @param {React.ReactNode} props.headerRight - Optional element to show on the right side of header
 * @param {object} props.style - Additional container styles
 * @param {object} props.contentStyle - Additional content area styles
 */
export default function Card({ title, children, headerRight, style, contentStyle }) {
  return (
    <View style={[styles.card, style]}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
        </View>
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

/**
 * A Card specifically for displaying status or info messages.
 */
export function InfoCard({ title, message, type = 'info', children }) {
  const typeStyles = {
    info: { bg: COLORS.primaryLight, border: COLORS.primary, text: COLORS.primaryDark },
    success: { bg: COLORS.successLight, border: COLORS.success, text: COLORS.success },
    error: { bg: COLORS.errorLight, border: COLORS.error, text: COLORS.error },
    warning: { bg: '#fffbeb', border: COLORS.warning, text: '#92400e' },
  };

  const colors = typeStyles[type] || typeStyles.info;

  return (
    <View style={[styles.infoCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      {title && <Text style={[styles.infoTitle, { color: colors.text }]}>{title}</Text>}
      {message && <Text style={[styles.infoMessage, { color: colors.text }]}>{message}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: SIZES.margin,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.base,
  },
  headerRight: {
    marginLeft: 'auto',
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  content: {
    padding: SIZES.padding,
  },
  infoCard: {
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadiusSm,
    borderWidth: 1,
    marginBottom: SIZES.margin,
  },
  infoTitle: {
    fontSize: SIZES.font,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoMessage: {
    fontSize: SIZES.font,
    lineHeight: 20,
  },
});