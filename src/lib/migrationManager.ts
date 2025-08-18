import { storageManager } from './storageManager';
import { updateImage, updateFile } from './database';
import { FirebaseImage, FirebaseFile } from '../types/firebase';

class MigrationManager {
  private migrationInProgress = new Set<string>();
  
  /**
   * Migrate images from base64 to Storage
   */
  async migrateImages(userId: string, images: Record<string, FirebaseImage>) {
    const migrationPromises: Promise<void>[] = [];
    
    for (const [imageId, image] of Object.entries(images)) {
      // Skip if already migrating or already in Storage
      if (this.migrationInProgress.has(imageId) || 
          !image.url.startsWith('data:')) {
        continue;
      }
      
      this.migrationInProgress.add(imageId);
      
      const migrationPromise = (async () => {
        try {
          console.log(`🔄 Migrating image ${imageId} to Storage...`);
          
          // Upload to Storage
          const storageUrl = await storageManager.uploadImage(userId, imageId, image.url);
          
          // Update database with new URL
          await updateImage(userId, imageId, { url: storageUrl });
          
          console.log(`✅ Image ${imageId} migrated successfully`);
        } catch (error) {
          console.error(`❌ Failed to migrate image ${imageId}:`, error);
        } finally {
          this.migrationInProgress.delete(imageId);
        }
      })();
      
      migrationPromises.push(migrationPromise);
    }
    
    // Run migrations in parallel (limit to 3 at a time to avoid overwhelming)
    const batchSize = 3;
    for (let i = 0; i < migrationPromises.length; i += batchSize) {
      const batch = migrationPromises.slice(i, i + batchSize);
      await Promise.all(batch);
    }
  }
  
  /**
   * Migrate files from base64 to Storage
   */
  async migrateFiles(userId: string, files: Record<string, FirebaseFile>) {
    const migrationPromises: Promise<void>[] = [];
    
    for (const [fileId, file] of Object.entries(files)) {
      // Skip if already migrating or already in Storage
      if (this.migrationInProgress.has(fileId) || 
          !file.url.startsWith('data:')) {
        continue;
      }
      
      this.migrationInProgress.add(fileId);
      
      const migrationPromise = (async () => {
        try {
          console.log(`🔄 Migrating file ${fileId} to Storage...`);
          
          // Upload to Storage
          const storageUrl = await storageManager.uploadFile(
            userId, 
            fileId, 
            file.url, 
            file.fileName
          );
          
          // Update database with new URL
          await updateFile(userId, fileId, { url: storageUrl });
          
          console.log(`✅ File ${fileId} migrated successfully`);
        } catch (error) {
          console.error(`❌ Failed to migrate file ${fileId}:`, error);
        } finally {
          this.migrationInProgress.delete(fileId);
        }
      })();
      
      migrationPromises.push(migrationPromise);
    }
    
    // Run migrations in parallel (limit to 3 at a time)
    const batchSize = 3;
    for (let i = 0; i < migrationPromises.length; i += batchSize) {
      const batch = migrationPromises.slice(i, i + batchSize);
      await Promise.all(batch);
    }
  }
  
  /**
   * Check if migration is needed
   */
  needsMigration(data: { url: string }): boolean {
    return !!(data.url && data.url.startsWith('data:'));
  }
  
  /**
   * Get migration statistics
   */
  getStats(images: Record<string, FirebaseImage>, files: Record<string, FirebaseFile>) {
    const imageStats = {
      total: Object.keys(images).length,
      migrated: Object.values(images).filter(img => !img.url.startsWith('data:')).length,
      pending: Object.values(images).filter(img => img.url.startsWith('data:')).length
    };
    
    const fileStats = {
      total: Object.keys(files).length,
      migrated: Object.values(files).filter(file => !file.url.startsWith('data:')).length,
      pending: Object.values(files).filter(file => file.url.startsWith('data:')).length
    };
    
    return {
      images: imageStats,
      files: fileStats,
      totalPending: imageStats.pending + fileStats.pending
    };
  }
}

export const migrationManager = new MigrationManager();