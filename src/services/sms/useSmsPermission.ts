import { useState, useCallback, useEffect } from 'react';
import { smsService } from './service';

export interface UseSmsPermissionResult {
  hasPermission: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  checkPermission: () => Promise<void>;
}

/**
 * Hook for SMS permission management
 */
export const useSmsPermission = (): UseSmsPermissionResult => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('[useSmsPermission] Checking SMS permission...');
      const result = await smsService.hasPermission();
      setHasPermission(result);
      console.log('[useSmsPermission] Permission check complete:', result ? 'GRANTED' : 'NOT_GRANTED');
    } catch (err) {
      console.error('[useSmsPermission] Error checking SMS permission:', err);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('[useSmsPermission] Requesting SMS permission from user...');
      const granted = await smsService.requestPermission();
      setHasPermission(granted);
      console.log('[useSmsPermission] Permission request completed:', granted ? 'GRANTED' : 'DENIED');
      return granted;
    } catch (err) {
      console.error('[useSmsPermission] Error requesting SMS permission:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    hasPermission,
    isLoading,
    requestPermission,
    checkPermission,
  };
};
