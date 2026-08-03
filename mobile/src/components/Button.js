import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { COLORS, SIZES } from '../config';

/**
 * Reusable Button component with multiple variants.
 *
 * @param {object} props
 * @param {string} props.title - Button text
 * @param {function} props.onPress - Press handler
 * @param {'primary'|'secondary'|'outline'|'destructive'|'ghost'} props.variant - Button style variant
 * @param {boolean} props.loading - Show loading spinner
 * @param {boolean} props.disabled - Disable button
 * @param {React.ReactNode} props.icon - Icon component to show before text
 * @param {string} props.size - 'sm', 'md', 'lg'
 * @param {object} props.style - Additional container styles
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon: Icon,
  size = 'md',
  style,
}) {
  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    isDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    isDisabled && styles.textDisabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white}
        />
      ) : (
        <View style={styles.content}>
          {Icon && <Icon width={size === 'sm' ? 16 : 20} height={size === 'sm' ? 16 : 20} style={styles.icon} />}
          {title && <Text style={textStyles}>{title}</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: SIZES.borderRadiusSm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  // Variants
  variant_primary: {
    backgroundColor: COLORS.primary,
  },
  variant_secondary: {
    backgroundColor: COLORS.secondary,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  variant_destructive: {
    backgroundColor: COLORS.error,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  // Sizes
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 36,
  },
  size_md: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  size_lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  // Disabled
  disabled: {
    opacity: 0.5,
  },
  // Content
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  // Text
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  text_primary: {
    color: COLORS.white,
  },
  text_secondary: {
    color: COLORS.white,
  },
  text_outline: {
    color: COLORS.primary,
  },
  text_destructive: {
    color: COLORS.white,
  },
  text_ghost: {
    color: COLORS.primary,
  },
  textSize_sm: {
    fontSize: 13,
  },
  textSize_md: {
    fontSize: SIZES.font,
  },
  textSize_lg: {
    fontSize: SIZES.medium,
  },
  textDisabled: {
    opacity: 0.7,
  },
});