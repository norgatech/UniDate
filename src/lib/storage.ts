/**
 * UniDate — Supabase Storage Utility
 * Handles cross-platform image uploads to Supabase Storage buckets
 * (Profile Photos & Private Student Verification Documents)
 */
import { Platform } from 'react-native';
import { supabase, isSupabaseConfigured } from './supabase';

export interface UploadResult {
  path: string | null;
  publicUrl: string | null;
  error: Error | null;
}

/**
 * Upload an image from local URI to a Supabase storage bucket
 */
export async function uploadImageToSupabase(
  bucket: 'profile-photos' | 'student-verifications',
  filePath: string,
  uri: string
): Promise<UploadResult> {
  try {
    if (!isSupabaseConfigured()) {
      return { path: filePath, publicUrl: uri, error: null };
    }

    let fileBody: Blob | ArrayBuffer;
    let contentType = 'image/jpeg';

    if (uri.startsWith('data:')) {
      // Data URI
      const base64Data = uri.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      fileBody = bytes.buffer;
    } else {
      // Standard local URI or Blob URL
      const response = await fetch(uri);
      if (Platform.OS === 'web') {
        fileBody = await response.blob();
        contentType = (fileBody as Blob).type || 'image/jpeg';
      } else {
        fileBody = await response.arrayBuffer();
      }
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBody, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn(`[Supabase Storage] Upload error for ${bucket}/${filePath}:`, error.message);
      return { path: null, publicUrl: uri, error: new Error(error.message) };
    }

    let publicUrl: string | null = null;
    if (bucket === 'profile-photos') {
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      publicUrl = urlData?.publicUrl || null;
    }

    return { path: data.path, publicUrl: publicUrl || uri, error: null };
  } catch (err: any) {
    console.warn(`[Supabase Storage] Exception uploading to ${bucket}:`, err.message);
    return { path: null, publicUrl: uri, error: err };
  }
}

