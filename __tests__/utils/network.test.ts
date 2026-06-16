import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import NetInfo from '@react-native-community/netinfo';
import type { NetInfoState } from '@react-native-community/netinfo';
import { Alert } from 'react-native';
import {
  OFFLINE_MUTATION_MESSAGE,
  getOfflineMutationMessage,
  isNetworkAvailable,
  offlineAlert,
  offlineError,
} from '../../utils/network';

function networkState(isConnected: boolean, isInternetReachable: boolean): NetInfoState {
  return {
    type: 'wifi',
    details: {},
    isConnected,
    isInternetReachable,
  } as unknown as NetInfoState;
}

describe('network helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('treats connected and reachable network state as available', async () => {
    jest.mocked(NetInfo.fetch).mockResolvedValue(networkState(true, true));

    await expect(isNetworkAvailable()).resolves.toBe(true);
    await expect(getOfflineMutationMessage()).resolves.toBeNull();
  });

  it('returns the offline mutation message when the device is disconnected', async () => {
    jest.mocked(NetInfo.fetch).mockResolvedValue(networkState(false, true));

    await expect(isNetworkAvailable()).resolves.toBe(false);
    await expect(getOfflineMutationMessage()).resolves.toBe(OFFLINE_MUTATION_MESSAGE);
  });

  it('sets an inline error instead of allowing an offline mutation', async () => {
    const setError = jest.fn();
    jest.mocked(NetInfo.fetch).mockResolvedValue(networkState(true, false));

    await expect(offlineError(setError)).resolves.toBe(false);
    expect(setError).toHaveBeenCalledWith(OFFLINE_MUTATION_MESSAGE);
  });

  it('shows an alert and blocks the action while offline', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    jest.mocked(NetInfo.fetch).mockResolvedValue(networkState(false, false));

    await expect(offlineAlert('Cannot save')).resolves.toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith('Cannot save', OFFLINE_MUTATION_MESSAGE);
  });
});
