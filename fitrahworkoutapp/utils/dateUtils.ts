// Utility functions for date handling in Redux and Firebase
export const dateUtils = {
  // Safe serialization function for complex objects with dates
  serializeObjectDates: (obj: any, visited = new WeakSet(), depth = 0): any => {
    // Prevent infinite recursion
    if (depth > 10) return obj;
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
      } catch {
        return new Date().toISOString();
      }
    }
    
    // Check for circular references
    if (visited.has(obj)) return '[Circular]';
    visited.add(obj);
    
    try {
      if (Array.isArray(obj)) {
        const result = obj.map(item => dateUtils.serializeObjectDates(item, visited, depth + 1));
        visited.delete(obj);
        return result;
      }
      
      if (obj.constructor === Object) {
        const serialized: any = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key) && typeof obj[key] !== 'function') {
            serialized[key] = dateUtils.serializeObjectDates(obj[key], visited, depth + 1);
          }
        }
        visited.delete(obj);
        return serialized;
      }
      
      visited.delete(obj);
      return obj;
    } catch (error) {
      visited.delete(obj);
      return obj;
    }
  },

  // Convert any date-like value to ISO string for Redux storage
  toISOString: (date: any): string => {
    if (!date) return new Date().toISOString();
    
    if (typeof date === 'string') {
      // Already a string, validate it's a valid date
      const parsed = new Date(date);
      return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
    }
    
    if (date instanceof Date) {
      return date.toISOString();
    }
    
    // Firebase Timestamp
    if (date.toDate && typeof date.toDate === 'function') {
      return date.toDate().toISOString();
    }
    
    // Fallback
    return new Date().toISOString();
  },

  // Convert ISO string back to Date object when needed
  fromISOString: (isoString: string): Date => {
    return new Date(isoString);
  },

  // Format date for display
  formatForDisplay: (isoString: string, locale: string = 'fr-FR'): string => {
    return new Date(isoString).toLocaleDateString(locale);
  },

  // Format datetime for display
  formatDateTimeForDisplay: (isoString: string, locale: string = 'fr-FR'): string => {
    return new Date(isoString).toLocaleString(locale);
  },

  // Get relative time (e.g., "il y a 2 heures")
  getRelativeTime: (isoString: string, locale: string = 'fr-FR'): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
    
    return date.toLocaleDateString(locale);
  },

  // Check if date is today
  isToday: (isoString: string): boolean => {
    const date = new Date(isoString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  // Check if date is this week
  isThisWeek: (isoString: string): boolean => {
    const date = new Date(isoString);
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    return date >= weekStart && date <= weekEnd;
  }
};