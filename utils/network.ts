import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

export const OFFLINE_MUTATION_MESSAGE =
  'No internet connection. You can view saved data offline, but changes need an internet connection.';

export async function isNetworkAvailable(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected !== false && state.isInternetReachable !== false;
}

export async function getOfflineMutationMessage(): Promise<string | null> {
  const isOnline = await isNetworkAvailable();
  return isOnline ? null : OFFLINE_MUTATION_MESSAGE;
}

export async function offlineError(
  setError: (message: string) => void,
): Promise<boolean> {
  const offlineMessage = await getOfflineMutationMessage();
  if (!offlineMessage) return true;

  setError(offlineMessage);
  return false;
}

export async function offlineAlert(title: string): Promise<boolean> {
  const offlineMessage = await getOfflineMutationMessage();
  if (!offlineMessage) return true;

  Alert.alert(title, offlineMessage);
  return false;
}
