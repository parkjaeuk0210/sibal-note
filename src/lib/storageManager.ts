import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { firebaseMetrics } from '../utils/firebaseMetrics';

class StorageManager {
  private readonly IMAGE_FOLDER = 'images';
  private readonly FILE_FOLDER = 'files';
  
  /**
   * Convert base64 data URL to Blob
   */
  private dataURLtoBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  /**
   * Upload image to Firebase Storage
   * @param userId User ID
   * @param imageId Unique image ID
   * @param dataUrl Base64 data URL
   * @returns Download URL
   */
  async uploadImage(userId: string, imageId: string, dataUrl: string): Promise<string> {
    if (!storage) {
      throw new Error('Firebase Storage is not initialized');
    }

    try {
      // Convert base64 to blob
      const blob = this.dataURLtoBlob(dataUrl);
      
      // Create storage reference
      const path = `${this.IMAGE_FOLDER}/${userId}/${imageId}`;
      const imageStorageRef = storageRef(storage, path);
      
      // Upload image
      console.log(`📤 Uploading image to Storage: ${path}`);
      const snapshot = await uploadBytes(imageStorageRef, blob, {
        contentType: blob.type,
        customMetadata: {
          userId,
          uploadedAt: new Date().toISOString()
        }
      });
      
      // Get download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);
      
      // Track metrics
      firebaseMetrics.incrementStorageUpload();
      
      console.log(`✅ Image uploaded successfully: ${downloadUrl}`);
      return downloadUrl;
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload file to Firebase Storage
   * @param userId User ID
   * @param fileId Unique file ID
   * @param dataUrl Base64 data URL
   * @param fileName Original file name
   * @returns Download URL
   */
  async uploadFile(userId: string, fileId: string, dataUrl: string, fileName: string): Promise<string> {
    if (!storage) {
      throw new Error('Firebase Storage is not initialized');
    }

    try {
      // Convert base64 to blob
      const blob = this.dataURLtoBlob(dataUrl);
      
      // Create storage reference with original file extension
      const extension = fileName.split('.').pop() || 'bin';
      const path = `${this.FILE_FOLDER}/${userId}/${fileId}.${extension}`;
      const fileStorageRef = storageRef(storage, path);
      
      // Upload file
      console.log(`📤 Uploading file to Storage: ${path}`);
      const snapshot = await uploadBytes(fileStorageRef, blob, {
        contentType: blob.type,
        customMetadata: {
          userId,
          originalName: fileName,
          uploadedAt: new Date().toISOString()
        }
      });
      
      // Get download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);
      
      // Track metrics
      firebaseMetrics.incrementStorageUpload();
      
      console.log(`✅ File uploaded successfully: ${downloadUrl}`);
      return downloadUrl;
    } catch (error) {
      console.error('❌ File upload failed:', error);
      throw error;
    }
  }

  /**
   * Delete image from Storage
   */
  async deleteImage(userId: string, imageId: string): Promise<void> {
    if (!storage) return;

    try {
      const path = `${this.IMAGE_FOLDER}/${userId}/${imageId}`;
      const imageStorageRef = storageRef(storage, path);
      await deleteObject(imageStorageRef);
      console.log(`🗑️ Image deleted from Storage: ${path}`);
    } catch (error: any) {
      // Ignore 404 errors (file doesn't exist)
      if (error.code !== 'storage/object-not-found') {
        console.error('❌ Image deletion failed:', error);
        throw error;
      }
    }
  }

  /**
   * Delete file from Storage
   */
  async deleteFile(userId: string, fileId: string, fileName?: string): Promise<void> {
    if (!storage) return;

    try {
      const extension = fileName?.split('.').pop() || 'bin';
      const path = `${this.FILE_FOLDER}/${userId}/${fileId}.${extension}`;
      const fileStorageRef = storageRef(storage, path);
      await deleteObject(fileStorageRef);
      console.log(`🗑️ File deleted from Storage: ${path}`);
    } catch (error: any) {
      // Ignore 404 errors (file doesn't exist)
      if (error.code !== 'storage/object-not-found') {
        console.error('❌ File deletion failed:', error);
        throw error;
      }
    }
  }

  /**
   * Check if URL is a Firebase Storage URL
   */
  isStorageUrl(url: string): boolean {
    return url.includes('firebasestorage.googleapis.com') || 
           url.includes('storage.googleapis.com');
  }

  /**
   * Migrate base64 image to Storage
   * Returns new URL if migration is needed, original URL if already in Storage
   */
  async migrateImageIfNeeded(userId: string, imageId: string, url: string): Promise<string> {
    // If already a Storage URL, no migration needed
    if (this.isStorageUrl(url)) {
      return url;
    }

    // If it's a base64 data URL, migrate to Storage
    if (url.startsWith('data:')) {
      console.log(`🔄 Migrating image ${imageId} to Storage...`);
      return await this.uploadImage(userId, imageId, url);
    }

    // Otherwise, return as is
    return url;
  }
}

export const storageManager = new StorageManager();