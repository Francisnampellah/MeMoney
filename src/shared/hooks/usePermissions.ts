import { PermissionsAndroid, Platform } from 'react-native';
import { useState, useCallback } from 'react';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState({
    sms: false,
    contacts: false,
  });

  const requestSmsPermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'MeMoney needs access to read your SMS messages for transaction detection',
          buttonNeutral: 'Ask me later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      setPermissions(prev => ({ ...prev, sms: isGranted }));
      return isGranted;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  }, []);

  return {
    permissions,
    requestSmsPermission,
  };
};
