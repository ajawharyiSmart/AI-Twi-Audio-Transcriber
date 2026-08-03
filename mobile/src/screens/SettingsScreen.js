import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import Card from '../components/Card';
import { loadSettings, saveSettings, clearAllData } from '../services/storage';
import { checkHealth } from '../services/api';
import { API_BASE_URL, COLORS, SIZES } from '../config';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    apiEndpoint: '',
    autoTranslate: true,
    darkMode: false,
  });
  const [serverStatus, setServerStatus] = useState(null);
  const [checkingServer, setCheckingServer] = useState(false);

  useEffect(() => {
    loadSettingsData();
  }, []);

  async function loadSettingsData() {
    const saved = await loadSettings();
    setSettings(saved);
  }

  async function handleSave() {
    await saveSettings(settings);
    Alert.alert('Settings Saved', 'Your preferences have been saved.');
  }

  async function handleTestConnection() {
    setCheckingServer(true);
    try {
      const status = await checkHealth();
      setServerStatus(status);
      Alert.alert(
        'Connection Successful',
        `Server is healthy.\nTwi Model: ${status.custom_twi_model_loaded ? '✓ Loaded' : '✗ Not loaded'}\nTranslation Model: ${status.translation_model_loaded ? '✓ Loaded' : '✗ Not loaded'}`
      );
    } catch (err) {
      setServerStatus(null);
      Alert.alert('Connection Failed', err.message || 'Could not reach the server.');
    } finally {
      setCheckingServer(false);
    }
  }

  async function handleClearData() {
    Alert.alert(
      'Clear All Data',
      'This will remove all locally cached transcriptions and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Cleared', 'All local data has been removed.');
          },
        },
      ]
    );
  }

  function toggleSetting(key) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* API Configuration */}
        <Card title="API Configuration">
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Ionicons name="server-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.settingLabelText}>Server URL</Text>
            </View>
          </View>
          <View style={styles.apiUrlContainer}>
            <Text style={styles.apiUrlLabel}>Current API Endpoint:</Text>
            <Text style={styles.apiUrlValue} selectable>
              {API_BASE_URL}
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="Test Connection"
              onPress={handleTestConnection}
              variant="outline"
              size="sm"
              loading={checkingServer}
              style={styles.flexButton}
            />
          </View>
        </Card>

        {/* Server Status */}
        {serverStatus && (
          <Card title="Server Status">
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Text style={[styles.statusValue, { color: COLORS.success }]}>
                Healthy
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Twi Model:</Text>
              <Text
                style={[
                  styles.statusValue,
                  {
                    color: serverStatus.custom_twi_model_loaded
                      ? COLORS.success
                      : COLORS.error,
                  },
                ]}
              >
                {serverStatus.custom_twi_model_loaded ? 'Loaded' : 'Not Loaded'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Translation Model:</Text>
              <Text
                style={[
                  styles.statusValue,
                  {
                    color: serverStatus.translation_model_loaded
                      ? COLORS.success
                      : COLORS.error,
                  },
                ]}
              >
                {serverStatus.translation_model_loaded ? 'Loaded' : 'Not Loaded'}
              </Text>
            </View>
          </Card>
        )}

        {/* Preferences */}
        <Card title="Preferences">
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Ionicons name="language-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.settingLabelText}>Auto-translate to English</Text>
            </View>
            <Switch
              value={settings.autoTranslate}
              onValueChange={() => toggleSetting('autoTranslate')}
              trackColor={{ false: COLORS.borderLight, true: COLORS.primaryLight }}
              thumbColor={settings.autoTranslate ? COLORS.primary : COLORS.textTertiary}
            />
          </View>
        </Card>

        {/* About */}
        <Card title="About">
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>App Name</Text>
            <Text style={styles.aboutValue}>Haki</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Backend</Text>
            <Text style={styles.aboutValue}>FastAPI + Whisper + NLLB</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Twi Model</Text>
            <Text style={styles.aboutValue}>Custom Whisper Fine-tune</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Translation</Text>
            <Text style={styles.aboutValue}>NLLB-200 + LoRA Adapter</Text>
          </View>
        </Card>

        {/* Danger Zone */}
        <Card title="Data Management">
          <View style={styles.dangerZone}>
            <View style={styles.dangerInfo}>
              <Ionicons name="warning-outline" size={20} color={COLORS.error} />
              <View style={styles.dangerTextContainer}>
                <Text style={styles.dangerTitle}>Clear Local Data</Text>
                <Text style={styles.dangerDescription}>
                  Remove all cached transcriptions and settings from this device.
                </Text>
              </View>
            </View>
            <Button
              title="Clear Data"
              onPress={handleClearData}
              variant="destructive"
              size="sm"
            />
          </View>
        </Card>

        {/* Save Button */}
        <Button
          title="Save Settings"
          onPress={handleSave}
          variant="primary"
          size="lg"
          style={styles.saveButton}
        />

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
    paddingTop: Platform.OS === 'ios' ? 60 : SIZES.padding,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.base,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabelText: {
    fontSize: SIZES.font,
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  apiUrlContainer: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadiusSm,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  apiUrlLabel: {
    fontSize: SIZES.small,
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  apiUrlValue: {
    fontSize: SIZES.font,
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  flexButton: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statusLabel: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    width: 130,
  },
  statusValue: {
    fontSize: SIZES.font,
    fontWeight: '600',
  },
  aboutRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  aboutLabel: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    width: 110,
  },
  aboutValue: {
    fontSize: SIZES.font,
    color: COLORS.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  dangerZone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dangerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: SIZES.margin,
  },
  dangerTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  dangerTitle: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dangerDescription: {
    fontSize: SIZES.small,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  saveButton: {
    marginTop: SIZES.base,
  },
});