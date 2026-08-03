import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, TYPOGRAPHY, SHADOW } from '../config';

interface Props {
  navigation: any;
}

export default function ProfileScreen({ navigation }: Props) {
  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', onPress: () => {} },
    { icon: 'settings-outline', label: 'Settings', onPress: () => navigation.navigate('Settings') },
    { icon: 'help-circle-outline', label: 'Help', onPress: () => {} },
    { icon: 'information-circle-outline', label: 'About', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color={COLORS.primary} />
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
        {/* Profile hero */}
        <View style={styles.profileHero}>
          {/* Avatar ring */}
          <View style={styles.avatarRingOuter}>
            <View style={styles.avatarRingInner}>
              <View style={styles.avatarLarge}>
                <Ionicons name="person" size={48} color={COLORS.primary} />
              </View>
            </View>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="pencil" size={14} color={COLORS.onPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>User</Text>
          <Text style={styles.profileEmail}>user@haki.ai</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, SHADOW.card]}>
            <Ionicons name="musical-notes-outline" size={20} color={COLORS.primary} />
            <Text style={[styles.statNumber, { color: COLORS.primary }]}>0</Text>
            <Text style={styles.statLabel}>RECORDINGS{'\n'}PROCESSED</Text>
          </View>
          <View style={[styles.statCard, SHADOW.card]}>
            <Ionicons name="timer-outline" size={20} color={COLORS.secondary} />
            <Text style={[styles.statNumber, { color: COLORS.secondary }]}>0</Text>
            <Text style={styles.statLabel}>MINUTES{'\n'}TRANSCRIBED</Text>
          </View>
        </View>

        {/* Menu list */}
        <View style={[styles.menuList, SHADOW.card]}>
          {menuItems.map(({ icon, label, onPress }, i) => (
            <TouchableOpacity
              key={label}
              style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}
              onPress={onPress}
              activeOpacity={0.8}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconBox}>
                  <Ionicons name={icon as any} size={20} color={COLORS.onSurfaceVariant} />
                </View>
                <Text style={styles.menuItemLabel}>{label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.outline} />
            </TouchableOpacity>
          ))}

          {/* Logout */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, styles.menuIconError]}>
                <Ionicons name="log-out-outline" size={20} color={COLORS.onErrorContainer} />
              </View>
              <Text style={[styles.menuItemLabel, { color: COLORS.error }]}>Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={`${COLORS.error}80`} />
          </TouchableOpacity>
        </View>

        {/* Language preference */}
        <View style={styles.langCard}>
          <View style={styles.langLeft}>
            <Ionicons name="language-outline" size={18} color={COLORS.secondary} />
            <Text style={styles.langText}>
              Active Translation: <Text style={{ fontWeight: '700' }}>Twi (Akan)</Text>
            </Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.changeBtn}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.versionText}>HAKI AI Transcription v2.0.0</Text>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { ...TYPOGRAPHY.headlineMd, color: COLORS.primary },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.containerMargin, paddingBottom: 100, paddingTop: SIZES.lg },

  // Profile hero
  profileHero: { alignItems: 'center', marginBottom: SIZES.xl },
  avatarRingOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    backgroundColor: COLORS.primary,
    marginBottom: SIZES.md,
    position: 'relative',
  },
  avatarRingInner: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.surface,
    overflow: 'hidden',
  },
  avatarLarge: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  profileName: { ...TYPOGRAPHY.headlineMd, color: COLORS.onSurface },
  profileEmail: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurfaceVariant },

  // Stats
  statsRow: { flexDirection: 'row', gap: SIZES.gutter, marginBottom: SIZES.xl },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: SIZES.md,
    alignItems: 'center',
    gap: SIZES.sm,
  },
  statNumber: { ...TYPOGRAPHY.displayLg },
  statLabel: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant, textAlign: 'center' },

  // Menu
  menuList: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SIZES.borderRadius * 1.5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginBottom: SIZES.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.lg,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.outlineVariant },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconError: { backgroundColor: COLORS.errorContainer },
  menuItemLabel: { ...TYPOGRAPHY.bodyLg, color: COLORS.onSurface },

  // Language
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${COLORS.secondaryContainer}1A`,
    borderWidth: 1,
    borderColor: `${COLORS.secondary}33`,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.md,
    marginBottom: SIZES.xl,
  },
  langLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, flex: 1 },
  langText: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSecondaryContainer },
  changeBtn: { ...TYPOGRAPHY.labelMd, color: COLORS.primary, textDecorationLine: 'underline' },

  versionText: { ...TYPOGRAPHY.labelMd, color: COLORS.outline, textAlign: 'center' },
});
