/**
 * Utility to sanitize Firebase User object for Redux storage
 * Extracts only serializable properties to prevent Redux serialization errors on Expo Go
 */

import { User } from 'firebase/auth';

export interface SerializableUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  isAnonymous: boolean;
  providerId: string | null;
}

/**
 * Sanitizes Firebase User object by extracting only serializable properties
 * @param firebaseUser - Firebase User object or null
 * @returns Sanitized user object with only serializable properties
 */
export function sanitizeUser(firebaseUser: User | null): SerializableUser | null {
  if (!firebaseUser) {
    return null;
  }

  try {
    // Extract only the essential, serializable properties
    const sanitizedUser: SerializableUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      emailVerified: firebaseUser.emailVerified,
      displayName: firebaseUser.displayName,
      isAnonymous: firebaseUser.isAnonymous,
      // Get providerId from first provider or null if empty
      providerId: firebaseUser.providerData && firebaseUser.providerData.length > 0 
        ? firebaseUser.providerData[0].providerId 
        : null,
    };

    return sanitizedUser;
  } catch (error) {
    console.warn('⚠️ Error sanitizing Firebase User object:', error);
    
    // Fallback to minimal user object
    return {
      uid: firebaseUser.uid || '',
      email: firebaseUser.email || null,
      emailVerified: false,
      displayName: firebaseUser.displayName || null,
      isAnonymous: firebaseUser.isAnonymous || false,
      providerId: null,
    };
  }
}

/**
 * Type guard to check if user object is sanitized
 * @param user - User object to check
 * @returns True if user is sanitized (SerializableUser)
 */
export function isSanitizedUser(user: any): user is SerializableUser {
  return user && 
    typeof user.uid === 'string' &&
    (user.email === null || typeof user.email === 'string') &&
    typeof user.emailVerified === 'boolean' &&
    (user.displayName === null || typeof user.displayName === 'string') &&
    typeof user.isAnonymous === 'boolean' &&
    (user.providerId === null || typeof user.providerId === 'string');
}