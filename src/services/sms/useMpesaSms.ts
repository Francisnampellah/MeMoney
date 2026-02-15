import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { smsService } from './service';
import { Transaction } from './types';

type UseMpesaSmsResult = {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useMpesaSms(autoLoad: boolean = true): UseMpesaSmsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Start as true to show initial load
  const [error, setError] = useState<string | null>(null);

  const readSms = useCallback(async (isSilent: boolean = false) => {
    if (Platform.OS !== 'android') {
      setTransactions([]);
      setLoading(false);
      return;
    }

    if (!isSilent) setLoading(true);
    setError(null);

    try {
      const hasPermission = await smsService.hasPermission();
      if (!hasPermission) {
        const granted = await smsService.requestPermission();
        if (!granted) {
          if (transactions.length === 0) {
            setError('SMS permission denied');
          }
          setLoading(false);
          return;
        }
      }

      // Sync and get latest merged data
      const result = await smsService.readSms();
      setTransactions(result);
    } catch (err) {
      console.error('[useMpesaSms] Error:', err);
      if (transactions.length === 0) {
        setError('Failed to read SMS');
      }
    } finally {
      setLoading(false);
    }
  }, [transactions.length]);

  // Initial load from storage and optional auto-load on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const stored = await smsService.getStoredTransactions();
        if (stored.length > 0) {
          setTransactions(stored);
          setLoading(false); // Stop blocking as soon as we have cached data
        }

        if (autoLoad) {
          // Perform a background refresh without putting the UI back into loading state
          // if we already have stored data
          readSms(stored.length > 0);
        } else if (stored.length === 0) {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [autoLoad, readSms]);

  return {
    transactions,
    loading,
    error,
    refresh: readSms,
  };
}
