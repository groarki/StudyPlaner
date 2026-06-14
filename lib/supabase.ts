import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const SECURE_STORE_CHUNK_SIZE = 1800;

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    const chunkCountValue = await SecureStore.getItemAsync(getChunkCountKey(key));
    const chunkCount = chunkCountValue ? Number(chunkCountValue) : 0;

    if (!chunkCount) {
      return SecureStore.getItemAsync(key);
    }

    const chunks = await Promise.all(
      Array.from({ length: chunkCount }, (_, index) =>
        SecureStore.getItemAsync(getChunkKey(key, index))
      )
    );

    return chunks.every((chunk): chunk is string => chunk !== null)
      ? chunks.join('')
      : null;
  },
  setItem: async (key: string, value: string) => {
    await removeSecureStoreValue(key);

    if (value.length <= SECURE_STORE_CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    const chunks = value.match(new RegExp(`.{1,${SECURE_STORE_CHUNK_SIZE}}`, 'g')) ?? [];

    await Promise.all(
      chunks.map((chunk, index) => SecureStore.setItemAsync(getChunkKey(key, index), chunk))
    );
    await SecureStore.setItemAsync(getChunkCountKey(key), `${chunks.length}`);
  },
  removeItem: (key: string) => removeSecureStoreValue(key),
};

function getChunkCountKey(key: string): string {
  return `${key}.chunkCount`;
}

function getChunkKey(key: string, index: number): string {
  return `${key}.chunk.${index}`;
}

async function removeSecureStoreValue(key: string): Promise<void> {
  const chunkCountValue = await SecureStore.getItemAsync(getChunkCountKey(key));
  const chunkCount = chunkCountValue ? Number(chunkCountValue) : 0;

  if (chunkCount) {
    await Promise.all(
      Array.from({ length: chunkCount }, (_, index) =>
        SecureStore.deleteItemAsync(getChunkKey(key, index))
      )
    );
  }

  await SecureStore.deleteItemAsync(getChunkCountKey(key));
  await SecureStore.deleteItemAsync(key);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
