export type Theme = 'light' | 'dark';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'CHF' | 'CNY' | 'INR' | 'KES';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
}

export interface AppSettings {
  theme: Theme;
  currency: Currency;
  language: 'en' | 'es' | 'fr' | 'de';
  notifications: {
    enabled: boolean;
    transactionAlerts: boolean;
    budgetAlerts: boolean;
    insightNotifications: boolean;
  };
  display: {
    showBalanceByDefault: boolean;
    transactionsPerPage: number;
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  };
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  currency: 'USD',
  language: 'en',
  notifications: {
    enabled: true,
    transactionAlerts: true,
    budgetAlerts: true,
    insightNotifications: true,
  },
  display: {
    showBalanceByDefault: true,
    transactionsPerPage: 20,
    dateFormat: 'MM/DD/YYYY',
  },
};

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
] as const;

export const DATE_FORMATS = [
  { code: 'MM/DD/YYYY' as const, example: '12/31/2025' },
  { code: 'DD/MM/YYYY' as const, example: '31/12/2025' },
  { code: 'YYYY-MM-DD' as const, example: '2025-12-31' },
] as const;
