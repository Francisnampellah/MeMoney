import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, DEFAULT_SETTINGS, Theme, Currency } from './types';
import { settingsService } from './settingsService';

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  updateTheme: (theme: Theme) => Promise<void>;
  updateCurrency: (currency: Currency) => Promise<void>;
  updateLanguage: (language: 'en' | 'es' | 'fr' | 'de') => Promise<void>;
  updateNotifications: (
    notifications: Partial<AppSettings['notifications']>
  ) => Promise<void>;
  updateDisplay: (display: Partial<AppSettings['display']>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loadedSettings = await settingsService.getSettings();
        setSettings(loadedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateTheme = async (theme: Theme) => {
    try {
      setSettings(prev => ({ ...prev, theme }));
      await settingsService.setTheme(theme);
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  };

  const updateCurrency = async (currency: Currency) => {
    try {
      setSettings(prev => ({ ...prev, currency }));
      await settingsService.setCurrency(currency);
    } catch (error) {
      console.error('Error updating currency:', error);
      throw error;
    }
  };

  const updateLanguage = async (language: 'en' | 'es' | 'fr' | 'de') => {
    try {
      setSettings(prev => ({ ...prev, language }));
      await settingsService.setLanguage(language);
    } catch (error) {
      console.error('Error updating language:', error);
      throw error;
    }
  };

  const updateNotifications = async (
    notifications: Partial<AppSettings['notifications']>
  ) => {
    try {
      setSettings(prev => ({
        ...prev,
        notifications: { ...prev.notifications, ...notifications },
      }));
      await settingsService.updateNotifications(notifications);
    } catch (error) {
      console.error('Error updating notifications:', error);
      throw error;
    }
  };

  const updateDisplay = async (display: Partial<AppSettings['display']>) => {
    try {
      setSettings(prev => ({
        ...prev,
        display: { ...prev.display, ...display },
      }));
      await settingsService.updateDisplay(display);
    } catch (error) {
      console.error('Error updating display:', error);
      throw error;
    }
  };

  const resetSettings = async () => {
    try {
      const newSettings = await settingsService.resetSettings();
      setSettings(newSettings);
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        updateTheme,
        updateCurrency,
        updateLanguage,
        updateNotifications,
        updateDisplay,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
