import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, DEFAULT_SETTINGS, Theme, Currency } from './types';

const SETTINGS_STORAGE_KEY = '@MeMoney:settings';

export const settingsService = {
  /**
   * Get all app settings
   */
  async getSettings(): Promise<AppSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (settingsJson) {
        const parsed = JSON.parse(settingsJson);
        // Merge with defaults to ensure all fields exist
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error getting settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Update app settings
   */
  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...updates };
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      console.log('✅ Settings updated:', updates);
      return newSettings;
    } catch (error) {
      console.error('🚨 Error updating settings:', error);
      throw error;
    }
  },

  /**
   * Update theme
   */
  async setTheme(theme: Theme): Promise<void> {
    try {
      await this.updateSettings({ theme });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update currency
   */
  async setCurrency(currency: Currency): Promise<void> {
    try {
      await this.updateSettings({ currency });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update language
   */
  async setLanguage(language: 'en' | 'es' | 'fr' | 'de'): Promise<void> {
    try {
      await this.updateSettings({ language });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update notification settings
   */
  async updateNotifications(
    notifications: Partial<AppSettings['notifications']>
  ): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      await this.updateSettings({
        notifications: { ...currentSettings.notifications, ...notifications },
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update display settings
   */
  async updateDisplay(
    display: Partial<AppSettings['display']>
  ): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      await this.updateSettings({
        display: { ...currentSettings.display, ...display },
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<AppSettings> {
    try {
      await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
      console.log('✅ Settings reset to defaults');
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  },
};
