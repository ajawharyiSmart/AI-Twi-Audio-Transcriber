import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  HISTORY: '@twi_transcriber_history',
  RECENT_RESULT: '@twi_transcriber_recent_result',
  SETTINGS: '@twi_transcriber_settings',
};

/**
 * Save transcription history locally for offline access.
 * @param {Array} history - Array of transcription records
 */
export async function saveHistory(history) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

/**
 * Load transcription history from local storage.
 * @returns {Promise<Array>} Saved transcription records
 */
export async function loadHistory() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

/**
 * Save the most recent transcription result for quick access.
 * @param {object} result - Transcription result object
 */
export async function saveRecentResult(result) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.RECENT_RESULT,
      JSON.stringify(result)
    );
  } catch (error) {
    console.error('Failed to save recent result:', error);
  }
}

/**
 * Load the most recent transcription result.
 * @returns {Promise<object|null} Saved result or null
 */
export async function loadRecentResult() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_RESULT);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load recent result:', error);
    return null;
  }
}

/**
 * Clear all locally stored data.
 */
export async function clearAllData() {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
}

/**
 * Save app settings.
 * @param {object} settings - Settings object
 */
export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify(settings)
    );
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * Load app settings.
 * @returns {Promise<object>} Saved settings
 */
export async function loadSettings() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data
      ? JSON.parse(data)
      : {
          apiEndpoint: '',
          autoTranslate: true,
          darkMode: false,
        };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {
      apiEndpoint: '',
      autoTranslate: true,
      darkMode: false,
    };
  }
}