import { File, Paths } from 'expo-file-system';
import { supabase } from '../lib/supabase';

export const AVATARS_BUCKET = 'avatars';

function getAvatarExtension(uri: string): string {
  const cleanUri = uri.split('?')[0] ?? uri;
  const extension = cleanUri.split('.').pop()?.toLowerCase();
  if (extension === 'png' || extension === 'webp') return extension;
  return 'jpg';
}

function getAvatarContentType(extension: string): string {
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  return 'image/jpeg';
}

export function isLocalFileUri(uri: string | null): uri is string {
  return Boolean(uri && (/^file:\/\//i.test(uri) || /^content:\/\//i.test(uri)));
}

export function getAvatarUploadErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : `${error}`;

  if (/bucket not found/i.test(message)) {
    return `Supabase Storage bucket "${AVATARS_BUCKET}" does not exist. Create it in Supabase Storage and allow authenticated users to upload avatars.`;
  }

  return message || 'Please try again.';
}

async function resolveReadableFile(uri: string): Promise<{ file: File; isTemp: boolean }> {
  if (uri.startsWith('content://')) {
    const tmp = new File(Paths.cache, `avatar_tmp_${Date.now()}`);
    const source = new File(uri);
    source.copy(tmp);
    return { file: tmp, isTemp: true };
  }
  return { file: new File(uri), isTemp: false };
}

export async function uploadAvatarToStorage(
  userId: string,
  uri: string
): Promise<string> {
  const extension = getAvatarExtension(uri);
  const contentType = getAvatarContentType(extension);
  const filePath = `${userId}/avatar-${Date.now()}.${extension}`;

  const { file, isTemp } = await resolveReadableFile(uri);

  const arrayBuffer = await file.arrayBuffer();

  if (isTemp) {
    file.delete();
  }

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(AVATARS_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteAvatarFromStorageUrl(url: string | null): Promise<void> {
  if (!url) return;
  try {
    const parsedUrl = new URL(url);
    const marker = `/object/public/${AVATARS_BUCKET}/`;
    const markerIndex = parsedUrl.pathname.indexOf(marker);
    if (markerIndex === -1) return;

    const filePath = decodeURIComponent(
      parsedUrl.pathname.slice(markerIndex + marker.length)
    );
    if (!filePath) return;

    const { error } = await supabase.storage.from(AVATARS_BUCKET).remove([filePath]);
    if (error) console.warn('[deleteAvatar] error:', error);
  } catch (err) {
    console.warn('[deleteAvatar] failed:', err);
  }
}
