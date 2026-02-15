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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const readSms = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setTransactions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const hasPermission = await smsService.hasPermission();
      if (!hasPermission) {
        const granted = await smsService.requestPermission();
        if (!granted) {
          setError('SMS permission denied');
          setLoading(false);
          return;
        }
      }

      const result = await smsService.readSms();
      setTransactions(result);
    } catch (err) {
      console.error('[useMpesaSms] Error:', err);
      setError('Failed to read SMS');
    } finally {
      setLoading(false);
    }
  }, []);

  // Optional auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      readSms();
    }
  }, [autoLoad, readSms]);

  return {
    transactions,
    loading,
    error,
    refresh: readSms,
  };
}
