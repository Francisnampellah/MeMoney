import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import { SmsMessage } from '../../shared/types';
import { mpesaParser } from './parser';
import { ParsedTransaction, Transaction } from './types';

const { SmsReader } = NativeModules;


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
   * Read SMS messages from device
   * Requires READ_SMS permission to be granted first
   */
  readSms: async (): Promise<Transaction[]> => {
    try {
      if (Platform.OS !== 'android') return [];

      const hasPermission = await SmsReader.hasPermission();
      if (!hasPermission) {
        console.warn('SMS permission not granted');
        return [];
      }

      // 1️⃣ Read SMS from native Android module
      const messages: SmsMessage[] = await SmsReader.readInbox();

      // 2️⃣ Filter ONLY M-Pesa messages
      const mpesaMessages = messages.filter(
        m =>
          m.address &&
          /M-PESA/i.test(m.address) &&
          /Confirmed\./i.test(m.body)
      );

      const transactions = mpesaMessages
        .map(m => mpesaParser.parseSms(m.body))
        .filter((t): t is Transaction => t !== null);

      return mpesaParser.deduplicateByTransactionId(transactions);


    } catch (err) {
      console.error('SMS Read Error:', err);
      return [];
    }
  },

  /**
   * Search for transaction-related SMS messages
   */
  //   searchTransactionSms: async (query: string): Promise<SmsMessage[]> => {
  //     try {
  //       const messages = await smsService.readSms();
  //       return messages.filter(msg =>
  //         msg.body.toLowerCase().includes(query.toLowerCase())
  //       );
  //     } catch (err) {
  //       console.error('SMS Search Error:', err);
  //       return [];
  //     }
  //   },

  /**
   * Parse multiple M-Pesa SMS messages
   * Automatically deduplicates by transaction_id (primary key)
   * Returns only one record per unique transaction_id
   */
  parseMpesaSmsList: (smsList: string[]): ParsedTransaction[] => {
    console.log('[SMS Service] Parsing', smsList.length, 'M-Pesa SMS messages');
    const parsed = mpesaParser.parseSmsList(smsList);
    console.log(
      '[SMS Service] After deduplication:',
      parsed.length,
      'unique transactions',
    );
    return parsed;
  },
};
