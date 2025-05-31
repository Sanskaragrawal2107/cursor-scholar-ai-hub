import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload a file to Supabase storage
 * @param bucket The bucket name ('assignments' or 'submissions')
 * @param file The file to upload
 * @param metadata Additional metadata to store with the file
 * @returns The file URL and path
 */
export async function uploadFile(bucket: string, file: File, metadata: Record<string, any> = {}) {
  // Create a unique file name
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Upload the file
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
      metadata
    });

  if (error) {
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path
  };
}

/**
 * Download a file from Supabase storage
 * @param bucket The bucket name
 * @param path The file path
 * @returns The file blob
 */
export async function downloadFile(bucket: string, path: string) {
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .download(path);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Delete a file from Supabase storage
 * @param bucket The bucket name
 * @param path The file path
 */
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase
    .storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw error;
  }

  return true;
}

/**
 * Get a signed URL for a file (for temporary access to private files)
 * @param bucket The bucket name
 * @param path The file path
 * @param expiresIn How many seconds the URL should be valid for
 * @returns The signed URL
 */
export async function getSignedUrl(bucket: string, path: string, expiresIn = 60) {
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw error;
  }

  return data.signedUrl;
} 