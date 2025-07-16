import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import workoutReducer from './slices/workoutSlice';
import nutritionReducer from './slices/nutritionSlice';
import timerReducer from './slices/timerSlice';
import adminReducer from './slices/adminSlice';

// Middleware to serialize dates automatically
const dateSerializationMiddleware = (store: any) => (next: any) => (action: any) => {
  // Helper function to recursively serialize dates with circular reference protection
  const serializeDates = (obj: any, visited = new WeakSet(), depth = 0): any => {
    // Prevent infinite recursion with max depth
    if (depth > 10) {
      console.warn('⚠️ Max depth reached in serializeDates, stopping recursion');
      return obj;
    }
    
    // Handle null, undefined, and primitives
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    
    // Handle Date objects
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    
    // Handle Firebase Timestamps
    if (obj && typeof obj.toDate === 'function') {
      try {
        return obj.toDate().toISOString();
      } catch (error) {
        console.warn('⚠️ Failed to convert Firebase timestamp:', error);
        return new Date().toISOString();
      }
    }
    
    // Check for circular references
    if (visited.has(obj)) {
      console.warn('⚠️ Circular reference detected in serializeDates');
      return '[Circular Reference]';
    }
    
    // Add to visited set
    visited.add(obj);
    
    // Handle arrays
    if (Array.isArray(obj)) {
      const result = obj.map(item => serializeDates(item, visited, depth + 1));
      visited.delete(obj);
      return result;
    }
    
    // Handle plain objects
    if (obj.constructor === Object || obj.constructor === undefined) {
      const serialized: any = {};
      
      try {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            // Skip functions and non-enumerable properties
            const value = obj[key];
            if (typeof value === 'function') continue;
            
            serialized[key] = serializeDates(value, visited, depth + 1);
          }
        }
      } catch (error) {
        console.warn('⚠️ Error serializing object property:', error);
      }
      
      visited.delete(obj);
      return serialized;
    }
    
    // For other object types (like Firebase User), try to extract serializable properties
    if (typeof obj === 'object') {
      try {
        // Check if it's already an ISO string
        if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
          visited.delete(obj);
          return obj;
        }
        
        // For complex objects, try to create a safe copy
        const serialized: any = {};
        const keys = Object.getOwnPropertyNames(obj).slice(0, 50); // Limit properties
        
        for (const key of keys) {
          try {
            const value = obj[key];
            if (typeof value === 'function') continue;
            if (key.startsWith('_')) continue; // Skip private properties
            
            serialized[key] = serializeDates(value, visited, depth + 1);
          } catch (error) {
            // Skip problematic properties
            continue;
          }
        }
        
        visited.delete(obj);
        return serialized;
      } catch (error) {
        console.warn('⚠️ Failed to serialize complex object:', error);
        visited.delete(obj);
        return '[Unserializable Object]';
      }
    }
    
    visited.delete(obj);
    return obj;
  };

  // Serialize dates in action payload
  try {
    if (action.payload) {
      action = {
        ...action,
        payload: serializeDates(action.payload)
      };
    }
  } catch (error) {
    console.error('❌ Error in dateSerializationMiddleware:', error);
    // Continue with original action if serialization fails
  }

  return next(action);
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    workout: workoutReducer,
    nutrition: nutritionReducer,
    timer: timerReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Enable strict serialization checking
        ignoredActions: [],
        ignoredPaths: [],
        // Custom check for remaining non-serializable values
        isSerializable: (value: any) => {
          // Allow null and undefined
          if (value === null || value === undefined) return true;
          
          // Allow primitives
          if (typeof value !== 'object') return true;
          
          // Allow plain objects and arrays
          if (Array.isArray(value) || value.constructor === Object) return true;
          
          // Allow Date objects (they should be serialized by our middleware)
          if (value instanceof Date) {
            console.warn('⚠️ Date object found in Redux state, should be serialized:', value);
            return false;
          }
          
          // Reject other objects
          console.warn('⚠️ Non-serializable value detected:', value);
          return false;
        },
      },
    }).concat(dateSerializationMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;