/**
 * Supabase Storage Utilities
 * Functions for managing files in Supabase Storage
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Storage bucket names
 */
export const STORAGE_BUCKETS = {
  PROJECT_FILES: 'project-files',
  PDF_IMAGES: 'pdf-images',
  SCREENSHOTS: 'screenshots',
  USER_UPLOADS: 'user-uploads',
} as const

/**
 * Read file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @returns File content as string
 */
export async function readFileFromStorage(
  bucket: string,
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path)
  
  if (error) {
    throw new Error(`Failed to read file from storage: ${error.message}`)
  }
  
  return await data.text()
}

/**
 * Read file as buffer from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @returns File content as Buffer
 */
export async function readFileBufferFromStorage(
  bucket: string,
  path: string
): Promise<Buffer> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path)
  
  if (error) {
    throw new Error(`Failed to read file from storage: ${error.message}`)
  }
  
  const arrayBuffer = await data.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Write file to Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @param content - File content (string or Buffer)
 * @param options - Upload options
 */
export async function writeFileToStorage(
  bucket: string,
  path: string,
  content: string | Buffer,
  options: {
    contentType?: string
    upsert?: boolean
  } = {}
): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, content, {
      contentType: options.contentType || 'text/plain',
      upsert: options.upsert ?? true,
    })
  
  if (error) {
    throw new Error(`Failed to write file to storage: ${error.message}`)
  }
}

/**
 * Delete file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 */
export async function deleteFileFromStorage(
  bucket: string,
  path: string
): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
  
  if (error) {
    throw new Error(`Failed to delete file from storage: ${error.message}`)
  }
}

/**
 * Delete multiple files from Supabase Storage
 * @param bucket - Storage bucket name
 * @param paths - Array of file paths in bucket
 */
export async function deleteFilesFromStorage(
  bucket: string,
  paths: string[]
): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths)
  
  if (error) {
    throw new Error(`Failed to delete files from storage: ${error.message}`)
  }
}

/**
 * List files in a directory
 * @param bucket - Storage bucket name
 * @param path - Directory path
 * @returns Array of file objects
 */
export async function listFilesInStorage(
  bucket: string,
  path: string = ''
): Promise<Array<{
  name: string
  id: string
  updated_at: string
  created_at: string
  last_accessed_at: string
  metadata: Record<string, any>
}>> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path)
  
  if (error) {
    throw new Error(`Failed to list files in storage: ${error.message}`)
  }
  
  return data || []
}

/**
 * Get public URL for a file
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @returns Public URL
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}

/**
 * Get signed URL for a private file
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  
  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }
  
  return data.signedUrl
}

/**
 * Check if file exists in storage
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @returns True if file exists
 */
export async function fileExistsInStorage(
  bucket: string,
  path: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path)
    
    return !error && data !== null
  } catch {
    return false
  }
}

/**
 * Copy file within storage
 * @param bucket - Storage bucket name
 * @param fromPath - Source file path
 * @param toPath - Destination file path
 */
export async function copyFileInStorage(
  bucket: string,
  fromPath: string,
  toPath: string
): Promise<void> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .copy(fromPath, toPath)
  
  if (error) {
    throw new Error(`Failed to copy file in storage: ${error.message}`)
  }
}

/**
 * Move file within storage
 * @param bucket - Storage bucket name
 * @param fromPath - Source file path
 * @param toPath - Destination file path
 */
export async function moveFileInStorage(
  bucket: string,
  fromPath: string,
  toPath: string
): Promise<void> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .move(fromPath, toPath)
  
  if (error) {
    throw new Error(`Failed to move file in storage: ${error.message}`)
  }
}

/**
 * Get file metadata
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @returns File metadata
 */
export async function getFileMetadata(
  bucket: string,
  path: string
): Promise<{
  size: number
  mimetype: string
  lastModified?: Date
}> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path)
  
  if (error) {
    throw new Error(`Failed to get file metadata: ${error.message}`)
  }
  
  return {
    size: data.size,
    mimetype: data.type,
    lastModified: (data as any).lastModified ? new Date((data as any).lastModified) : undefined
  }
}

/**
 * Upload multiple files
 * @param bucket - Storage bucket name
 * @param files - Array of {path, content, contentType}
 */
export async function uploadMultipleFiles(
  bucket: string,
  files: Array<{
    path: string
    content: string | Buffer
    contentType?: string
  }>
): Promise<void> {
  const uploadPromises = files.map(file =>
    writeFileToStorage(bucket, file.path, file.content, {
      contentType: file.contentType,
      upsert: true
    })
  )
  
  await Promise.all(uploadPromises)
}

/**
 * Create storage bucket if it doesn't exist
 * Note: This requires admin privileges
 * @param bucketName - Name of the bucket to create
 * @param isPublic - Whether the bucket should be public
 */
export async function createBucketIfNotExists(
  bucketName: string,
  isPublic: boolean = false
): Promise<void> {
  const { data: buckets } = await supabase.storage.listBuckets()
  
  const bucketExists = buckets?.some(b => b.name === bucketName)
  
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: isPublic,
      fileSizeLimit: 52428800, // 50MB
    })
    
    if (error) {
      throw new Error(`Failed to create bucket: ${error.message}`)
    }
  }
}
