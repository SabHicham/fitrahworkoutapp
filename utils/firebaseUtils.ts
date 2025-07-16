import { Platform } from 'react-native';
import { clearFirebaseCacheManually } from '@/config/firebase';

// Utility functions for Firebase error handling and cache management
export const firebaseUtils = {
  // Check if error is related to cache/persistence
  isCacheError(error: any): boolean {
    if (!error) return false;
    
    const cacheErrorCodes = [
      'permission-denied',
      'failed-precondition',
      'aborted',
      'unavailable',
      'internal',
      'unknown'
    ];
    
    const cacheErrorMessages = [
      'BloomFilterError',
      'IndexedDB',
      'persistence',
      'cache',
      'offline',
      'permissions'
    ];
    
    return cacheErrorCodes.includes(error?.code) || 
           cacheErrorMessages.some(msg => error?.message && error.message.includes(msg));
  },

  // Handle cache-related errors
  async handleCacheError(error: any): Promise<boolean> {
    if (!error) return false;
    
    console.log('🔧 Handling cache error:', error.message);
    
    if (this.isCacheError(error)) {
      console.log('🧹 Attempting to clear Firebase cache...');
      const cleared = await clearFirebaseCacheManually();
      
      if (cleared) {
        console.log('✅ Cache cleared successfully');
        return true;
      } else {
        console.log('❌ Failed to clear cache');
        return false;
      }
    }
    
    return false;
  },

  // Retry operation with cache clearing
  async retryWithCacheClear<T>(
    operation: () => Promise<T>,
    maxRetries: number = 2
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.log(`❌ Operation failed (attempt ${attempt + 1}):`, error.message);
        
        if (attempt < maxRetries && this.isCacheError(error)) {
          console.log('🔄 Retrying after cache clear...');
          await this.handleCacheError(error);
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // Ensure we always throw an Error object
    if (lastError instanceof Error) {
      throw lastError;
    } else {
      throw new Error(lastError ? String(lastError) : 'Unknown error occurred');
    }
  },

  // Get user-friendly error message
  getUserFriendlyError(error: any): string {
    if (!error) {
      return 'Une erreur inconnue est survenue.';
    }
    
    if (this.isCacheError(error)) {
      return 'Problème de cache détecté. L\'application va se reconnecter automatiquement.';
    }
    
    switch (error.code || 'unknown') {
      case 'permission-denied':
        return 'Accès refusé. Veuillez vérifier vos permissions.';
      case 'not-found':
        return 'Données non trouvées.';
      case 'unavailable':
        return 'Service temporairement indisponible. Veuillez réessayer.';
      case 'deadline-exceeded':
        return 'Opération expirée. Veuillez réessayer.';
      case 'resource-exhausted':
        return 'Quota dépassé. Veuillez réessayer plus tard.';
      default:
        return 'Une erreur est survenue. Veuillez réessayer.';
    }
  },

  // Log error with context
  logError(error: any, context: string) {
    if (!error) {
      console.error(`❌ Firebase Error [${context}]: Unknown error (error object is null/undefined)`);
      return;
    }
    
    console.error(`❌ Firebase Error [${context}]:`, {
      code: error?.code || 'unknown',
      message: error?.message || 'No message available',
      stack: error?.stack || 'No stack trace available',
      isCacheError: this.isCacheError(error),
      platform: Platform.OS
    });
  }
};