import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { userService, workoutService, nutritionService, achievementService, objectivesService } from '@/services/firestore';
import { firebaseUtils } from '@/utils/firebaseUtils';

// Hook for objectives management
export function useObjectives() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  const saveObjectives = async (objectives: any[]) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseUtils.retryWithCacheClear(
        () => objectivesService.saveUserObjectives(user.uid, objectives),
        3
      );
      
      if (result.success) {
        console.log('✅ Objectifs sauvegardés avec succès');
      } else {
        throw new Error(result.error);
      }
      
      setLoading(false);
      return result;
    } catch (error: any) {
      console.error('❌ Erreur lors de la sauvegarde des objectifs:', error);
      setError(firebaseUtils.getUserFriendlyError(error));
      firebaseUtils.logError(error, 'saveObjectives');
      setLoading(false);
      return { success: false, error };
    }
  };

  const loadObjectives = async () => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    console.log('🔍 loadObjectives - User ID:', user.uid);
    console.log('🔍 loadObjectives - User email:', user.email);
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseUtils.retryWithCacheClear(
        async () => {
          console.log('🔄 Tentative de chargement des objectifs pour:', user.uid);
          return await objectivesService.getUserObjectives(user.uid);
        },
        3
      );
      
      if (result.success && result.data) {
        console.log('✅ Objectifs chargés avec succès');
      } else {
        console.log('ℹ️ Aucun objectif personnalisé trouvé');
      }
      
      setLoading(false);
      return result;
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des objectifs:', error);
      setError(firebaseUtils.getUserFriendlyError(error));
      firebaseUtils.logError(error, 'loadObjectives');
      setLoading(false);
      return { success: false, error };
    }
  };

  const savePerformances = async (performances: any) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseUtils.retryWithCacheClear(
        () => objectivesService.saveUserPerformances(user.uid, performances),
        3
      );
      
      if (result.success) {
        console.log('✅ Performances sauvegardées avec succès');
      } else {
        throw new Error(result.error);
      }
      
      setLoading(false);
      return result;
    } catch (error: any) {
      console.error('❌ Erreur lors de la sauvegarde des performances:', error);
      setError(firebaseUtils.getUserFriendlyError(error));
      firebaseUtils.logError(error, 'savePerformances');
      setLoading(false);
      return { success: false, error };
    }
  };

  const loadPerformances = async () => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    console.log('🔍 loadPerformances - User ID:', user.uid);
    console.log('🔍 loadPerformances - User email:', user.email);
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseUtils.retryWithCacheClear(
        async () => {
          console.log('🔄 Tentative de chargement des performances pour:', user.uid);
          return await objectivesService.getUserPerformances(user.uid);
        },
        3
      );
      
      if (result.success && result.data) {
        console.log('✅ Performances chargées avec succès');
      } else {
        console.log('ℹ️ Aucune performance personnalisée trouvée');
      }
      
      setLoading(false);
      return result;
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des performances:', error);
      setError(firebaseUtils.getUserFriendlyError(error));
      firebaseUtils.logError(error, 'loadPerformances');
      setLoading(false);
      return { success: false, error };
    }
  };

  return {
    loading,
    error,
    saveObjectives,
    loadObjectives,
    savePerformances,
    loadPerformances
  };
}

// Hook for user profile management with enhanced error handling
export function useUserProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  const createProfile = async (userData: any) => {
    if (!user) {
      console.error('User not authenticated');
      return { success: false, error: 'User not authenticated' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Creating profile for user:', user.uid);
      
      const result = await firebaseUtils.retryWithCacheClear(async () => {
        return await userService.createUserProfile(user.uid, userData);
      });
      
      if (!result.success) {
        console.error('Failed to create profile:', result.error);
        setError(firebaseUtils.getUserFriendlyError(result.error));
      } else {
        console.log('Profile created successfully');
      }
      
      setLoading(false);
      return result;
    } catch (error: any) {
      firebaseUtils.logError(error, 'createProfile');
      setError(firebaseUtils.getUserFriendlyError(error));
      setLoading(false);
      return { success: false, error };
    }
  };

  const updateProfile = async (updates: any) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      // Ensure dates are serialized as ISO strings
      const serializedUpdates = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      const result = await firebaseUtils.retryWithCacheClear(async () => {
        return await userService.updateUserProfile(user.uid, serializedUpdates);
      });
      
      if (!result.success) {
        setError(firebaseUtils.getUserFriendlyError(result.error));
      }
      
      setLoading(false);
      return result;
    } catch (error: any) {
      firebaseUtils.logError(error, 'updateProfile');
      setError(firebaseUtils.getUserFriendlyError(error));
      setLoading(false);
      return { success: false, error };
    }
  };

  const getProfile = async () => {
    if (!user) {
      console.log('No user authenticated');
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Getting profile for user:', user.uid);
      
      const result = await firebaseUtils.retryWithCacheClear(async () => {
        return await userService.getUserProfile(user.uid);
      });
      
      if (!result.success) {
        console.log('Profile not found - new user');
      } else {
        console.log('Profile found:', result.data);
      }
      
      setLoading(false);
      return result;
    } catch (error: any) {
      firebaseUtils.logError(error, 'getProfile');
      setLoading(false);
      return { success: false, error };
    }
  };

  return {
    loading,
    error,
    createProfile,
    updateProfile,
    getProfile
  };
}

// Hook for workout management with enhanced error handling
export function useWorkouts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);

  const saveWorkout = async (workoutData: any) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseUtils.retryWithCacheClear(async () => {
        return await workoutService.saveWorkoutSession(user.uid, workoutData);
      });
      
      if (!result.success) {
        setError(firebaseUtils.getUserFriendlyError(result.error));
      } else {
        // Refresh workouts list
        loadWorkouts();
      }
      
      setLoading(false);
      return result;
    } catch (error: any) {
      firebaseUtils.logError(error, 'saveWorkout');
      setError(firebaseUtils.getUserFriendlyError(error));
      setLoading(false);
      return { success: false, error };
    }
  };

  const loadWorkouts = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseUtils.retryWithCacheClear(async () => {
        return await workoutService.getUserWorkouts(user.uid);
      });
      
      if (result.success) {
        setWorkouts(result.data || []);
      } else {
        setError(firebaseUtils.getUserFriendlyError(result.error));
      }
      
      setLoading(false);
    } catch (error: any) {
      firebaseUtils.logError(error, 'loadWorkouts');
      setError(firebaseUtils.getUserFriendlyError(error));
      setLoading(false);
    }
  };

  const updateWorkoutProgress = async (workoutId: string, progress: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseUtils.retryWithCacheClear(async () => {
        return await workoutService.updateWorkoutProgress(workoutId, progress);
      });
      
      if (!result.success) {
        setError(firebaseUtils.getUserFriendlyError(result.error));
      } else {
        // Refresh workouts list
        loadWorkouts();
      }
      
      setLoading(false);
      return result;
    } catch (error: any) {
      firebaseUtils.logError(error, 'updateWorkoutProgress');
      setError(firebaseUtils.getUserFriendlyError(error));
      setLoading(false);
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (user) {
      loadWorkouts();
    }
  }, [user]);

  return {
    loading,
    error,
    workouts,
    saveWorkout,
    loadWorkouts,
    updateWorkoutProgress
  };
}

// Hook for nutrition management with enhanced error handling
export function useNutrition() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);

  const saveMealPlan = async (mealPlanData: any) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseUtils.retryWithCacheClear(async () => {
        return await nutritionService.saveMealPlan(user.uid, mealPlanData);
      });
      
      if (!result.success) {
        setError(firebaseUtils.getUserFriendlyError(result.error));
      } else {
        // Refresh meal plans list
        loadMealPlans();
      }
      
      setLoading(false);
      return result;
    } catch (error: any) {
      firebaseUtils.logError(error, 'saveMealPlan');
      setError(firebaseUtils.getUserFriendlyError(error));
      setLoading(false);
      return { success: false, error };
    }
  };

  const loadMealPlans = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseUtils.retryWithCacheClear(async () => {
        return await nutritionService.getUserMealPlans(user.uid);
      });
      
      if (result.success) {
        setMealPlans(result.data || []);
      } else {
        setError(firebaseUtils.getUserFriendlyError(result.error));
      }
      
      setLoading(false);
    } catch (error: any) {
      firebaseUtils.logError(error, 'loadMealPlans');
      setError(firebaseUtils.getUserFriendlyError(error));
      setLoading(false);
    }
  };

  const logFood = async (foodData: any) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseUtils.retryWithCacheClear(async () => {
        return await nutritionService.logFoodIntake(user.uid, foodData);
      });
      
      if (!result.success) {
        setError(firebaseUtils.getUserFriendlyError(result.error));
      }
      
      setLoading(false);
      return result;
    } catch (error: any) {
      firebaseUtils.logError(error, 'logFood');
      setError(firebaseUtils.getUserFriendlyError(error));
      setLoading(false);
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (user) {
      loadMealPlans();
    }
  }, [user]);

  return {
    loading,
    error,
    mealPlans,
    saveMealPlan,
    loadMealPlans,
    logFood
  };
}

// Hook for achievements management with enhanced error handling
export function useAchievements() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  const updateAchievements = async (achievements: any) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseUtils.retryWithCacheClear(async () => {
        return await achievementService.updateAchievements(user.uid, achievements);
      });
      
      if (!result.success) {
        setError(firebaseUtils.getUserFriendlyError(result.error));
      }
      
      setLoading(false);
      return result;
    } catch (error: any) {
      firebaseUtils.logError(error, 'updateAchievements');
      setError(firebaseUtils.getUserFriendlyError(error));
      setLoading(false);
      return { success: false, error };
    }
  };

  const unlockAchievement = async (achievementData: any) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseUtils.retryWithCacheClear(async () => {
        return await achievementService.unlockAchievement(user.uid, achievementData);
      });
      
      if (!result.success) {
        setError(firebaseUtils.getUserFriendlyError(result.error));
      }
      
      setLoading(false);
      return result;
    } catch (error: any) {
      firebaseUtils.logError(error, 'unlockAchievement');
      setError(firebaseUtils.getUserFriendlyError(error));
      setLoading(false);
      return { success: false, error };
    }
  };

  return {
    loading,
    error,
    updateAchievements,
    unlockAchievement
  };
}