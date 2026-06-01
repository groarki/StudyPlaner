import * as FileSystem from 'expo-file-system/legacy';

export async function saveFileToAppStorage(uri: string): Promise<string> {
  const filename = uri.split('/').pop() || `file-${Date.now()}`;
  const dir = `${FileSystem.documentDirectory}tasks/`;
  const dirInfo = await FileSystem.getInfoAsync(dir);

  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  const destination = `${dir}${Date.now()}-${filename}`;
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
}
