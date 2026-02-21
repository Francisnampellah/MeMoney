import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSettings, CURRENCIES, LANGUAGES, DATE_FORMATS } from '../../services/settings';
import { useTheme } from '../../theme';

export function SettingsScreen() {
  const { settings, loading, updateTheme, updateCurrency, updateLanguage, updateNotifications, updateDisplay, resetSettings } = useSettings();
  const [themeModal, setThemeModal] = useState(false);
  const [currencyModal, setCurrencyModal] = useState(false);
  const [languageModal, setLanguageModal] = useState(false);
  const [dateFormatModal, setDateFormatModal] = useState(false);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  const theme = useTheme();
  const styles = createStyles(theme);

  // ... handlers ...
  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    setUpdatingSettings(true);
    try {
      await updateTheme(newTheme);
      setThemeModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update theme');
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleCurrencyChange = async (currency: any) => {
    setUpdatingSettings(true);
    try {
      await updateCurrency(currency);
      setCurrencyModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update currency');
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleLanguageChange = async (language: any) => {
    setUpdatingSettings(true);
    try {
      await updateLanguage(language);
      setLanguageModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update language');
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleDateFormatChange = async (format: any) => {
    setUpdatingSettings(true);
    try {
      await updateDisplay({ dateFormat: format });
      setDateFormatModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update date format');
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleNotificationToggle = async (key: 'enabled' | 'transactionAlerts' | 'budgetAlerts' | 'insightNotifications') => {
    try {
      await updateNotifications({
        [key]: !settings.notifications[key],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const handleBalanceVisibilityToggle = async () => {
    try {
      await updateDisplay({
        showBalanceByDefault: !settings.display.showBalanceByDefault,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update display settings');
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to defaults?',
      [
        { text: 'Cancel', onPress: () => { }, style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              await resetSettings();
              Alert.alert('Success', 'Settings have been reset to defaults');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset settings');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>

        {/* Theme Setting */}
        <SettingRow
          icon="palette"
          label="Theme"
          value={settings.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          onPress={() => setThemeModal(true)}
        />
      </View>

      {/* Currency & Display Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Currency & Display</Text>

        <SettingRow
          icon="attach-money"
          label="Currency"
          value={CURRENCIES[settings.currency].name}
          onPress={() => setCurrencyModal(true)}
        />

        <SettingRow
          icon="calendar-today"
          label="Date Format"
          value={settings.display.dateFormat}
          onPress={() => setDateFormatModal(true)}
        />

        <SettingRow
          icon="visibility"
          label="Show Balance by Default"
          isToggle
          value={settings.display.showBalanceByDefault}
          onToggle={handleBalanceVisibilityToggle}
        />
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language & Region</Text>

        <SettingRow
          icon="language"
          label="Language"
          value={LANGUAGES.find(l => l.code === settings.language)?.name || 'English'}
          onPress={() => setLanguageModal(true)}
        />
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <SettingRow
          icon="notifications-active"
          label="Enable Notifications"
          isToggle
          value={settings.notifications.enabled}
          onToggle={() => handleNotificationToggle('enabled')}
        />

        {settings.notifications.enabled && (
          <>
            <SettingRow
              icon="payment"
              label="Transaction Alerts"
              isToggle
              value={settings.notifications.transactionAlerts}
              onToggle={() => handleNotificationToggle('transactionAlerts')}
              indent
            />

            <SettingRow
              icon="trending-up"
              label="Budget Alerts"
              isToggle
              value={settings.notifications.budgetAlerts}
              onToggle={() => handleNotificationToggle('budgetAlerts')}
              indent
            />

            <SettingRow
              icon="lightbulb"
              label="Insight Notifications"
              isToggle
              value={settings.notifications.insightNotifications}
              onToggle={() => handleNotificationToggle('insightNotifications')}
              indent
            />
          </>
        )}
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.aboutContainer}>
          <Icon name="info" size={24} color={theme.colors.primary} />
          <View style={styles.aboutContent}>
            <Text style={styles.appName}>MeMoney</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              Smart Financial Management App {'\n'}
              Track, analyze, and optimize your finances
            </Text>
          </View>
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetSettings}
          disabled={updatingSettings}
        >
          <Icon name="refresh" size={20} color="#E74C3C" />
          <Text style={styles.resetButtonText}>Reset All Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Theme Selection Modal */}
      <Modal
        visible={themeModal && !updatingSettings}
        transparent
        animationType="fade"
        onRequestClose={() => setThemeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setThemeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Theme</Text>

            <TouchableOpacity
              style={[
                styles.modalOption,
                settings.theme === 'dark' && styles.modalOptionSelected,
              ]}
              onPress={() => handleThemeChange('dark')}
            >
              <Icon name="brightness-4" size={24} color={theme.colors.primary} />
              <Text style={styles.modalOptionText}>Dark Theme</Text>
              {settings.theme === 'dark' && (
                <Icon name="check-circle" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalOption,
                settings.theme === 'light' && styles.modalOptionSelected,
              ]}
              onPress={() => handleThemeChange('light')}
            >
              <Icon name="brightness-7" size={24} color={theme.colors.primary} />
              <Text style={styles.modalOptionText}>Light Theme</Text>
              {settings.theme === 'light' && (
                <Icon name="check-circle" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Currency Selection Modal */}
      <Modal
        visible={currencyModal && !updatingSettings}
        transparent
        animationType="fade"
        onRequestClose={() => setCurrencyModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCurrencyModal(false)}
        >
          <View style={[styles.modalContent, styles.largeModal]}>
            <Text style={styles.modalTitle}>Select Currency</Text>

            <FlatList
              data={Object.values(CURRENCIES)}
              keyExtractor={item => item.code}
              scrollEnabled
              nestedScrollEnabled
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    settings.currency === item.code && styles.modalOptionSelected,
                  ]}
                  onPress={() => handleCurrencyChange(item.code)}
                >
                  <Text style={styles.currencySymbol}>{item.symbol}</Text>
                  <Text style={styles.modalOptionText}>{item.name}</Text>
                  {settings.currency === item.code && (
                    <Icon name="check-circle" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={languageModal && !updatingSettings}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLanguageModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>

            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.modalOption,
                  settings.language === lang.code && styles.modalOptionSelected,
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Icon name="language" size={24} color={theme.colors.primary} />
                <Text style={styles.modalOptionText}>{lang.name}</Text>
                {settings.language === lang.code && (
                  <Icon name="check-circle" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Format Selection Modal */}
      <Modal
        visible={dateFormatModal && !updatingSettings}
        transparent
        animationType="fade"
        onRequestClose={() => setDateFormatModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDateFormatModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date Format</Text>

            {DATE_FORMATS.map(format => (
              <TouchableOpacity
                key={format.code}
                style={[
                  styles.modalOption,
                  settings.display.dateFormat === format.code && styles.modalOptionSelected,
                ]}
                onPress={() => handleDateFormatChange(format.code)}
              >
                <Icon name="calendar-today" size={24} color={theme.colors.primary} />
                <View style={styles.formatContent}>
                  <Text style={styles.modalOptionText}>{format.code}</Text>
                  <Text style={styles.formatExample}>{format.example}</Text>
                </View>
                {settings.display.dateFormat === format.code && (
                  <Icon name="check-circle" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string | boolean;
  isToggle?: boolean;
  onPress?: () => void;
  onToggle?: () => void;
  indent?: boolean;
}

function SettingRow({
  icon,
  label,
  value,
  isToggle,
  onPress,
  onToggle,
  indent,
}: SettingRowProps) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.lg,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          marginBottom: theme.spacing.sm,
        },
        indent && { marginLeft: theme.spacing.md, marginRight: 0 }
      ]}
      onPress={onPress}
      disabled={isToggle}
      activeOpacity={0.7}
    >
      <Icon name={icon} size={20} color={theme.colors.primary} />
      <Text style={{
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginLeft: theme.spacing.md,
      }}>{label}</Text>

      {isToggle ? (
        <Switch
          value={!!value}
          onValueChange={onToggle}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={theme.colors.surface}
        />
      ) : (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        }}>
          <Text style={{
            fontSize: 13,
            fontWeight: '500',
            color: theme.colors.primary,
          }}>{value as string}</Text>
          <Icon name="chevron-right" size={20} color={theme.colors.text.secondary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    maxHeight: '70%',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  largeModal: {
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  modalOptionSelected: {
    backgroundColor: theme.colors.primary + '10',
  },
  modalOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    width: 30,
    textAlign: 'center',
  },
  formatContent: {
    flex: 1,
  },
  formatExample: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },

  // About Section
  aboutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  aboutContent: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  appVersion: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  appDescription: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },

  // Reset Button
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderWidth: 1,
    borderColor: '#E74C3C',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E74C3C',
  },
});
