import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, TYPOGRAPHY, SHADOW } from '../config';

interface Props {
  navigation: any;
}

export default function SettingsScreen({ navigation }: Props) {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoTranslate, setAutoTranslate] = useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This action is permanent and will remove all your transcription history.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Account deletion initiated.') },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.brandName}>HAKI</Text>
        </View>
        <View style={styles.headerRight}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
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
        <Text style={styles.pageTitle}>Settings</Text>
        <Text style={styles.pageSubtitle}>Manage your account preferences and application settings.</Text>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={[styles.section, SHADOW.card]}>
          {/* Dark mode */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIconBox}>
                <Ionicons name="moon-outline" size={20} color={COLORS.onSurfaceVariant} />
              </View>
              <View>
                <Text style={styles.rowTitle}>Dark Mode</Text>
                <Text style={styles.rowSubtitle}>Adjust visual appearance</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: COLORS.outlineVariant, true: COLORS.primary }}
              thumbColor={COLORS.surfaceContainerLowest}
            />
          </View>

          <View style={styles.divider} />

          {/* Notifications */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIconBox}>
                <Ionicons name="notifications-outline" size={20} color={COLORS.onSurfaceVariant} />
              </View>
              <View>
                <Text style={styles.rowTitle}>Notifications</Text>
                <Text style={styles.rowSubtitle}>Push alerts and activity</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.outlineVariant, true: COLORS.primary }}
              thumbColor={COLORS.surfaceContainerLowest}
            />
          </View>

          <View style={styles.divider} />

          {/* Auto Translate */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIconBox}>
                <Ionicons name="language-outline" size={20} color={COLORS.onSurfaceVariant} />
              </View>
              <View>
                <Text style={styles.rowTitle}>Auto Translate</Text>
                <Text style={styles.rowSubtitle}>Translate to English automatically</Text>
              </View>
            </View>
            <Switch
              value={autoTranslate}
              onValueChange={setAutoTranslate}
              trackColor={{ false: COLORS.outlineVariant, true: COLORS.primary }}
              thumbColor={COLORS.surfaceContainerLowest}
            />
          </View>
        </View>

        {/* Account & Legal */}
        <Text style={styles.sectionLabel}>ACCOUNT & LEGAL</Text>
        <View style={[styles.section, SHADOW.card]}>
          {[
            { icon: 'globe-outline', label: 'Language', value: 'Twi / English', chevron: true },
            { icon: 'shield-checkmark-outline', label: 'Privacy Policy', chevron: true },
            { icon: 'document-text-outline', label: 'Terms of Service', chevron: true },
          ].map(({ icon, label, value, chevron }, i, arr) => (
            <React.Fragment key={label}>
              <TouchableOpacity style={styles.navRow} activeOpacity={0.8}>
                <View style={styles.rowLeft}>
                  <Ionicons name={icon as any} size={20} color={COLORS.onSurfaceVariant} />
                  <Text style={styles.navRowLabel}>{label}</Text>
                </View>
                <View style={styles.navRowRight}>
                  {value && <Text style={styles.navRowValue}>{value}</Text>}
                  {chevron && <Ionicons name="chevron-forward" size={16} color={COLORS.outline} />}
                </View>
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}

          <View style={styles.divider} />

          {/* Delete account */}
          <TouchableOpacity style={styles.navRow} onPress={handleDeleteAccount} activeOpacity={0.8}>
            <View style={styles.rowLeft}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              <Text style={[styles.navRowLabel, { color: COLORS.error, fontWeight: '600' }]}>Delete Account</Text>
            </View>
            <Ionicons name="warning-outline" size={16} color={`${COLORS.error}80`} />
          </TouchableOpacity>
        </View>

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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  brandName: { ...TYPOGRAPHY.headlineMd, color: COLORS.primary },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.containerMargin, paddingBottom: 100, paddingTop: SIZES.md },

  pageTitle: { ...TYPOGRAPHY.headlineSm, color: COLORS.onSurface, marginBottom: SIZES.xs },
  pageSubtitle: { ...TYPOGRAPHY.bodySm, color: COLORS.onSurfaceVariant, marginBottom: SIZES.lg },

  sectionLabel: { ...TYPOGRAPHY.labelMd, color: COLORS.primary, letterSpacing: 1.5, marginBottom: SIZES.sm, marginTop: SIZES.md },

  section: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    overflow: 'hidden',
    marginBottom: SIZES.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.md,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md, flex: 1 },
  rowIconBox: {
    width: 40,
    height: 40,
    borderRadius: SIZES.borderRadiusSm,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { ...TYPOGRAPHY.bodyMd, fontWeight: '600', color: COLORS.onSurface },
  rowSubtitle: { ...TYPOGRAPHY.bodySm, color: COLORS.outline },

  divider: { height: 1, backgroundColor: COLORS.outlineVariant, marginHorizontal: SIZES.md },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.md,
  },
  navRowLabel: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface },
  navRowRight: { flexDirection: 'row', alignItems: 'center', gap: SIZES.xs },
  navRowValue: { ...TYPOGRAPHY.bodySm, color: COLORS.outline },

  versionText: { ...TYPOGRAPHY.labelMd, color: COLORS.outline, textAlign: 'center', marginTop: SIZES.xl },
});
