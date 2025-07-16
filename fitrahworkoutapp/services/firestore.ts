import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';

// Enhanced error handling for Firestore operations
const handleFirestoreError = (error: any, operation: string) => {
  console.error(`❌ Firestore ${operation} error:`, error);
  
  // Handle specific Firebase errors
  switch (error.code) {
    case 'unavailable':
      return { success: false, error: 'Service temporarily unavailable. Please try again.' };
    case 'permission-denied':
      return { success: false, error: 'Permission denied. Please check your authentication.' };
    case 'not-found':
      return { success: false, error: 'Document not found.' };
    case 'already-exists':
      return { success: false, error: 'Document already exists.' };
    case 'resource-exhausted':
      return { success: false, error: 'Quota exceeded. Please try again later.' };
    case 'failed-precondition':
      return { success: false, error: 'Operation failed due to precondition.' };
    case 'aborted':
      return { success: false, error: 'Operation was aborted. Please try again.' };
    case 'out-of-range':
      return { success: false, error: 'Operation out of range.' };
    case 'unimplemented':
      return { success: false, error: 'Operation not implemented.' };
    case 'internal':
      return { success: false, error: 'Internal server error. Please try again.' };
    case 'deadline-exceeded':
      return { success: false, error: 'Operation timed out. Please try again.' };
    case 'cancelled':
      return { success: false, error: 'Operation was cancelled.' };
    default:
      return { success: false, error: error.message || 'An unknown error occurred.' };
  }
};

// User Profile Services
export const userService = {
  // Create user profile
  async createUserProfile(userId: string, userData: any) {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return handleFirestoreError(error, 'create user profile');
    }
  },

  // Get user profile
  async getUserProfile(userId: string) {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Convert Timestamps to ISO strings for Redux compatibility
        const serializedData = {
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
        return { success: true, data: serializedData };
      } else {
        return { success: false, error: 'User profile not found' };
      }
    } catch (error) {
      return handleFirestoreError(error, 'get user profile');
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: any) {
    try {
      console.log('💾 Mise à jour du profil utilisateur:', userId, updates);
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Profil utilisateur mis à jour avec succès');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du profil:', error);
      return handleFirestoreError(error, 'update user profile');
    }
  }
};

// Workout Services
export const workoutService = {
  // Save workout session
  async saveWorkoutSession(userId: string, workoutData: any) {
    try {
      const docRef = await addDoc(collection(db, 'workouts'), {
        userId,
        ...workoutData,
        createdAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return handleFirestoreError(error, 'save workout session');
    }
  },

  // Get user workouts
  async getUserWorkouts(userId: string, limitCount = 10) {
    try {
      const q = query(
        collection(db, 'workouts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const workouts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert timestamps to ISO strings
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      }));
      
      return { success: true, data: workouts };
    } catch (error) {
      return handleFirestoreError(error, 'get user workouts');
    }
  },

  // Update workout progress
  async updateWorkoutProgress(workoutId: string, progress: any) {
    try {
      await updateDoc(doc(db, 'workouts', workoutId), {
        ...progress,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return handleFirestoreError(error, 'update workout progress');
    }
  }
};

// Nutrition Services
export const nutritionService = {
  // Save meal plan
  async saveMealPlan(userId: string, mealPlanData: any) {
    try {
      const docRef = await addDoc(collection(db, 'mealPlans'), {
        userId,
        ...mealPlanData,
        createdAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return handleFirestoreError(error, 'save meal plan');
    }
  },

  // Get user meal plans
  async getUserMealPlans(userId: string, limitCount = 30) {
    try {
      const q = query(
        collection(db, 'mealPlans'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const mealPlans = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert timestamps to ISO strings
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      }));
      
      return { success: true, data: mealPlans };
    } catch (error) {
      return handleFirestoreError(error, 'get user meal plans');
    }
  },

  // Log food intake
  async logFoodIntake(userId: string, foodData: any) {
    try {
      const docRef = await addDoc(collection(db, 'foodLogs'), {
        userId,
        ...foodData,
        createdAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return handleFirestoreError(error, 'log food intake');
    }
  }
};

// Achievement Services
export const achievementService = {
  // Update user achievements
  async updateAchievements(userId: string, achievements: any) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        achievements,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return handleFirestoreError(error, 'update achievements');
    }
  },

  // Add achievement unlock
  async unlockAchievement(userId: string, achievementData: any) {
    try {
      const docRef = await addDoc(collection(db, 'achievementUnlocks'), {
        userId,
        ...achievementData,
        unlockedAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return handleFirestoreError(error, 'unlock achievement');
    }
  }
};

// Analytics Services
export const analyticsService = {
  // Log user activity
  async logActivity(userId: string, activityData: any) {
    try {
      const docRef = await addDoc(collection(db, 'userActivities'), {
        userId,
        ...activityData,
        timestamp: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return handleFirestoreError(error, 'log activity');
    }
  },

  // Get user statistics
  async getUserStats(userId: string, dateRange?: { start: Date, end: Date }) {
    try {
      let q = query(
        collection(db, 'userActivities'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      if (dateRange) {
        q = query(q, 
          where('timestamp', '>=', dateRange.start),
          where('timestamp', '<=', dateRange.end)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const activities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert timestamps to ISO strings
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
      }));
      
      return { success: true, data: activities };
    } catch (error) {
      return handleFirestoreError(error, 'get user stats');
    }
  }
};

// Objectives Services
export const objectivesService = {
  // Save user objectives
  async saveUserObjectives(userId: string, objectives: any[]) {
    try {
      console.log('💾 Sauvegarde des objectifs pour userId:', userId);
      await setDoc(doc(db, 'userObjectives', userId), {
        objectives,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return handleFirestoreError(error, 'save user objectives');
    }
  },

  // Get user objectives
  async getUserObjectives(userId: string) {
    try {
      console.log('📖 Récupération des objectifs pour userId:', userId);
      const docRef = doc(db, 'userObjectives', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
          success: true, 
          data: {
            objectives: data.objectives || [],
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
          }
        };
      } else {
        return { success: false, error: 'User objectives not found' };
      }
    } catch (error) {
      return handleFirestoreError(error, 'get user objectives');
    }
  },

  // Save user performances and badges
  async saveUserPerformances(userId: string, performances: any) {
    try {
      console.log('💾 Sauvegarde des performances pour userId:', userId);
      await setDoc(doc(db, 'userPerformances', userId), {
        ...performances,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return handleFirestoreError(error, 'save user performances');
    }
  },

  // Get user performances and badges
  async getUserPerformances(userId: string) {
    try {
      console.log('📖 Récupération des performances pour userId:', userId);
      const docRef = doc(db, 'userPerformances', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
          success: true, 
          data: {
            ...data,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
          }
        };
      } else {
        return { success: false, error: 'User performances not found' };
      }
    } catch (error) {
      return handleFirestoreError(error, 'get user performances');
    }
  }
};