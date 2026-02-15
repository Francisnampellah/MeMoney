import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SmsMessage } from '../../shared/types';
import { mpesaParser } from './parser';
import { ParsedTransaction, Transaction } from './types';

const { SmsReader } = NativeModules;

const STORAGE_KEYS = {
  TRANSACTIONS: 'memoney_transactions',
  LAST_SYNC_TIME: 'memoney_last_sync_time',
};

/**
 * SMS Service - Handles reading SMS messages from device
 * Integrated with permissions system
 */

export const smsService = {
  /**
   * Request SMS read permission from user
   */
  requestPermission: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      console.log('[SMS Permission] Not Android platform, skipping SMS permission request');
      return false;
    }

    try {
      console.log('[SMS Permission] Requesting SMS read permission...');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission Required',
          message: 'MeMoney needs access to read your SMS messages to detect transactions automatically',
          buttonNeutral: 'Ask me later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        },
      );

      const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      console.log('[SMS Permission] Permission request result:', isGranted ? 'GRANTED' : 'DENIED');
      return isGranted;
    } catch (err) {
      console.error('[SMS Permission] Error requesting permission:', err);
      return false;
    }
  },

  /**
   * Check if SMS permission is already granted
   */
  hasPermission: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      console.log('[SMS Permission] Not Android platform, SMS permission not available');
      return false;
    }

    try {
      console.log('[SMS Permission] Checking SMS read permission status...');
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
      );
      console.log('[SMS Permission] Current SMS permission status:', granted ? 'GRANTED' : 'NOT_GRANTED');
      return granted;
    } catch (err) {
      console.error('[SMS Permission] Error checking permission:', err);
      return false;
    }
  },

  /**
   * Load transactions already saved in local storage
   */
  getStoredTransactions: async (): Promise<Transaction[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) return [];
      const transactions = JSON.parse(data) as Transaction[];
      return transactions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (err) {
      console.error('[SMS Service] Error loading stored transactions:', err);
      return [];
    }
  },

  /**
   * Save transactions to local storage
   */
  saveTransactions: async (transactions: Transaction[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (err) {
      console.error('[SMS Service] Error saving transactions:', err);
    }
  },

  /**
   * Read SMS messages from device and sync with local storage
   * Only processes messages since the last sync
   */
  readSms: async (): Promise<Transaction[]> => {
    try {
      if (Platform.OS !== 'android') return [];

      const hasPermission = await smsService.hasPermission();
      if (!hasPermission) {
        console.warn('SMS permission not granted');
        return [];
      }

      // 1. Get existing stored transactions
      const storedTransactions = await smsService.getStoredTransactions();

      // 2. Get the time of the last processed message
      const lastSyncTimeStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);
      const lastSyncTime = lastSyncTimeStr ? parseInt(lastSyncTimeStr, 10) : 0;

      // 3. Read SMS from native Android module - Prefer optimized method if available
      let messages: SmsMessage[] = [];
      if (SmsReader.readInboxFrom) {
        messages = await SmsReader.readInboxFrom(lastSyncTime);
      } else {
        // Fallback for older builds that haven't recompiled yet
        const allMessages: SmsMessage[] = await SmsReader.readInbox();
        messages = allMessages.filter(m => m.date > lastSyncTime);
      }

      // 4. Filter for M-Pesa specific messages
      const newMpesaMessages = messages.filter(
        m =>
          m.address &&
          /M-PESA/i.test(m.address) &&
          /Confirmed\./i.test(m.body)
      );

      console.log('[SMS Service] Found', newMpesaMessages.length, 'new M-Pesa messages since', new Date(lastSyncTime).toLocaleString());

      if (newMpesaMessages.length === 0) {
        return storedTransactions;
      }

      // 5. Parse only the new messages
      const newTransactions = newMpesaMessages
        .map(m => mpesaParser.parseSms(m.body, m.date))
        .filter((t): t is Transaction => t !== null);

      // 6. Merge with stored transactions and deduplicate
      const allTransactions = [...newTransactions, ...storedTransactions];
      const uniqueTransactions = mpesaParser.deduplicateByTransactionId(allTransactions);

      // 7. Sort by timestamp descending (newest first)
      uniqueTransactions.sort((a, b) => b.timestamp - a.timestamp);

      // 8. Update local storage
      await smsService.saveTransactions(uniqueTransactions);

      // Update last sync time to the newest message date found
      const maxDate = Math.max(...messages.map(m => m.date), lastSyncTime);
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, maxDate.toString());

      return uniqueTransactions;

    } catch (err) {
      console.error('SMS Sync Error:', err);
      // Fallback: return what we have stored
      return await smsService.getStoredTransactions();
    }
  },

  /**
   * Parse multiple M-Pesa SMS messages
   * Automatically deduplicates by transaction_id (primary key)
   */
  parseMpesaSmsList: (smsList: string[]): ParsedTransaction[] => {
    console.log('[SMS Service] Parsing', smsList.length, 'M-Pesa SMS messages');
    const parsed = mpesaParser.parseSmsList(smsList);
    return parsed;
  },
};
