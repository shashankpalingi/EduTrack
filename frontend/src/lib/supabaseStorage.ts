import { supabase } from './supabaseClient';

// Types for storage operations
export interface FileUploadResult {
  path: string | null;
  error: Error | null;
}

export interface FileDeleteResult {
  error: Error | null;
}

/**
 * Upload a file to Supabase Storage
 * @param bucket The storage bucket name ('materials' or 'avatars')
 * @param path The path within the bucket where the file should be stored
 * @param file The file to upload
 * @returns Promise with the file path or error
 */
export async function uploadFile(bucket: string, path: string, file: File): Promise<FileUploadResult> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw error;
    }

    return { path: data?.path || null, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { path: null, error: error as Error };
  }
}

/**
 * Get a public URL for a file in Supabase Storage
 * @param bucket The storage bucket name ('materials' or 'avatars')
 * @param path The path of the file within the bucket
 * @returns The public URL of the file
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from Supabase Storage
 * @param bucket The storage bucket name ('materials' or 'avatars')
 * @param path The path of the file to delete
 * @returns Promise with success or error
 */
export async function deleteFile(bucket: string, path: string): Promise<FileDeleteResult> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { error: error as Error };
  }
}

/**
 * Upload a profile avatar and update the user's profile
 * @param userId The user's ID
 * @param file The avatar image file
 * @returns Promise with the avatar URL or error
 */
export async function uploadAvatar(userId: string, file: File): Promise<{ avatarUrl: string | null; error: Error | null }> {
  try {
    // Create a unique file path for the avatar
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    // Upload the file to the avatars bucket
    const { path, error: uploadError } = await uploadFile('avatars', filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    if (!path) {
      throw new Error('Upload failed: No path returned');
    }

    // Get the public URL
    const avatarUrl = getPublicUrl('avatars', path);

    // Update the user's profile with the new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    return { avatarUrl, error: null };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return { avatarUrl: null, error: error as Error };
  }
}

/**
 * Upload a teaching material file
 * @param teacherId The teacher's ID
 * @param file The material file
 * @param title The title of the material
 * @param description Optional description of the material
 * @returns Promise with the material data or error
 */
export async function uploadMaterial(
  teacherId: string,
  file: File,
  title: string,
  description?: string
): Promise<{ materialId: string | null; fileUrl: string | null; error: Error | null }> {
  try {
    // Create a unique file path for the material
    const fileExt = file.name.split('.').pop();
    const filePath = `${teacherId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

    // Upload the file to the materials bucket
    const { path, error: uploadError } = await uploadFile('materials', filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    if (!path) {
      throw new Error('Upload failed: No path returned');
    }

    // Get the public URL
    const fileUrl = getPublicUrl('materials', path);

    // Determine file type
    const fileType = file.type || `application/${fileExt}`;

    // Create a new material record in the database
    const { data, error: insertError } = await supabase
      .from('materials')
      .insert({
        title,
        description,
        file_url: fileUrl,
        file_type: fileType,
        teacher_id: teacherId
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return { materialId: data?.id || null, fileUrl, error: null };
  } catch (error) {
    console.error('Error uploading material:', error);
    return { materialId: null, fileUrl: null, error: error as Error };
  }
}