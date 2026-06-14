import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

type NetworkStatus = {
  isConnected: boolean;
  isInternetReachable: boolean;
  isOffline: boolean;
};

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    isOffline: false,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected ?? true;
      const isInternetReachable = state.isInternetReachable ?? true;

      setStatus({
        isConnected,
        isInternetReachable,
        isOffline: !isConnected || !isInternetReachable,
      });
    });

    return unsubscribe;
  }, []);

  return status;
}
