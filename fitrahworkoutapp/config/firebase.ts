import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, clearIndexedDbPersistence, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyAy9Yhwp4ZdNAc_t5JFmI52RIH_zSKbupk",
  authDomain: "fitrahworkout-a2e5d.firebaseapp.com",
  projectId: "fitrahworkout-a2e5d",
  storageBucket: "fitrahworkout-a2e5d.firebasestorage.app",
  messagingSenderId: "657382956097",
  appId: "1:657382956097:web:c9a21468a96810c1c5fac0",
  measurementId: "G-38J45J2CVV"
};

console.log('🔥 Initializing Firebase...');

// Clear any existing Firebase cache on web to prevent BloomFilterError
const clearFirebaseCache = async () => {
  if (Platform.OS === 'web') {
    try {
      // Clear IndexedDB persistence for Firestore
      await clearIndexedDbPersistence(getFirestore());
      console.log('✅ Firebase cache cleared successfully');
    } catch (error) {
      // This is expected if there's no existing persistence
      console.log('ℹ️ No existing Firebase cache to clear');
    }
  }
};

// Initialize Firebase app (only once)
let app;
if (getApps().length === 0) {
  console.log('🔥 Creating new Firebase app instance...');
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
} else {
  console.log('🔥 Using existing Firebase app instance...');
  app = getApp();
}

// Initialize Auth with proper persistence
let auth;
try {
  if (Platform.OS === 'web') {
    console.log('🔐 Initializing Auth for web...');
    auth = getAuth(app);
  } else {
    console.log('🔐 Initializing Auth for mobile with AsyncStorage persistence...');
    // For React Native, use initializeAuth with AsyncStorage persistence
    const existingAuth = getApps().find(app => app.name === '[DEFAULT]');
    if (existingAuth) {
      auth = getAuth(existingAuth);
    } else {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    }
  }
  console.log('✅ Auth initialized successfully');
} catch (error: any) {
  console.log('⚠️ Auth already initialized, using existing instance');
  auth = getAuth(app);
}

// Initialize Firestore with error handling
let db;
try {
  db = getFirestore(app);
  console.log('✅ Firestore initialized successfully');
  
  // Clear cache on web to prevent BloomFilterError
  if (Platform.OS === 'web') {
    clearFirebaseCache().catch(console.warn);
  }
} catch (error) {
  console.error('❌ Error initializing Firestore:', error);
  throw error;
}

// Initialize Storage
let storage;
try {
  storage = getStorage(app);
  console.log('✅ Firebase Storage initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Storage:', error);
  throw error;
}

// Add network state management for better error handling
const handleNetworkError = async () => {
  if (Platform.OS === 'web') {
    try {
      await disableNetwork(db);
      await enableNetwork(db);
      console.log('🔄 Network reconnected');
    } catch (error) {
      console.warn('⚠️ Network reconnection failed:', error);
    }
  }
};

// Export a function to clear cache manually if needed
export const clearFirebaseCacheManually = async () => {
  if (Platform.OS === 'web') {
    try {
      await disableNetwork(db);
      await clearIndexedDbPersistence(db);
      await enableNetwork(db);
      console.log('✅ Firebase cache cleared manually');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear Firebase cache:', error);
      return false;
    }
  }
  return true;
};

// Final verification
console.log('🔥 Firebase initialization complete:', {
  app: app ? '✅ Ready' : '❌ Failed',
  auth: auth ? '✅ Ready' : '❌ Failed',
  firestore: db ? '✅ Ready' : '❌ Failed',
  storage: storage ? '✅ Ready' : '❌ Failed',
  platform: Platform.OS,
  appsCount: getApps().length
});

export { auth, db, storage, handleNetworkError };
export default app;