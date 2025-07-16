import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '@/config/firebase';

// Service pour la gestion des exercices
export const exerciseService = {
  async getAllExercises() {
    try {
      const querySnapshot = await getDocs(collection(db, 'exercises'));
      return {
        success: true,
        data: querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    } catch (error) {
      console.error('Error getting exercises:', error);
      return { success: false, error };
    }
  },

  async createExercise(exerciseData: any) {
    try {
      const docRef = await addDoc(collection(db, 'exercises'), exerciseData);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating exercise:', error);
      return { success: false, error };
    }
  },

  async updateExercise(exerciseId: string, updates: any) {
    try {
      await updateDoc(doc(db, 'exercises', exerciseId), updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating exercise:', error);
      return { success: false, error };
    }
  },

  async deleteExercise(exerciseId: string) {
    try {
      await deleteDoc(doc(db, 'exercises', exerciseId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting exercise:', error);
      return { success: false, error };
    }
  },

  async getExercisesByFilters(filters: {
    category?: string;
    level?: string;
    equipment?: string;
  }) {
    try {
      let q = collection(db, 'exercises');
      
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters.level) {
        q = query(q, where('level', '==', filters.level));
      }
      if (filters.equipment) {
        q = query(q, where('equipment', '==', filters.equipment));
      }
      
      const querySnapshot = await getDocs(q);
      return {
        success: true,
        data: querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    } catch (error) {
      console.error('Error getting filtered exercises:', error);
      return { success: false, error };
    }
  }
};

// Service pour la gestion des recettes
export const recipeService = {
  async getAllRecipes() {
    try {
      const querySnapshot = await getDocs(collection(db, 'recipes'));
      return {
        success: true,
        data: querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    } catch (error) {
      console.error('Error getting recipes:', error);
      return { success: false, error };
    }
  },

  async createRecipe(recipeData: any) {
    try {
      const docRef = await addDoc(collection(db, 'recipes'), recipeData);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating recipe:', error);
      return { success: false, error };
    }
  },

  async updateRecipe(recipeId: string, updates: any) {
    try {
      await updateDoc(doc(db, 'recipes', recipeId), updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating recipe:', error);
      return { success: false, error };
    }
  },

  async deleteRecipe(recipeId: string) {
    try {
      await deleteDoc(doc(db, 'recipes', recipeId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting recipe:', error);
      return { success: false, error };
    }
  },

  async getRecipesByFilters(filters: {
    diet?: string;
    goal?: string;
    season?: string;
    mealType?: string;
  }) {
    try {
      let q = collection(db, 'recipes');
      
      if (filters.diet) {
        q = query(q, where('diet', '==', filters.diet));
      }
      if (filters.goal) {
        q = query(q, where('goal', '==', filters.goal));
      }
      if (filters.season) {
        q = query(q, where('season', '==', filters.season));
      }
      if (filters.mealType) {
        q = query(q, where('mealType', '==', filters.mealType));
      }
      
      const querySnapshot = await getDocs(q);
      return {
        success: true,
        data: querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    } catch (error) {
      console.error('Error getting filtered recipes:', error);
      return { success: false, error };
    }
  }
};

// Service pour la gestion des programmes
export const programService = {
  async getAllPrograms() {
    try {
      console.log('📖 Chargement de tous les programmes...');
      const querySnapshot = await getDocs(collection(db, 'userPrograms'));
      console.log('📊 Programmes trouvés:', querySnapshot.size);
      
      return {
        success: true,
        data: querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    } catch (error) {
      console.error('❌ Erreur lors du chargement des programmes:', error);
      console.error('❌ Code:', error.code, 'Message:', error.message);
      return { success: false, error };
    }
  },

  async createProgram(programData: any) {
    try {
      const docRef = await addDoc(collection(db, 'userPrograms'), programData);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating program:', error);
      return { success: false, error };
    }
  },

  async updateProgram(programId: string, updates: any) {
    try {
      await updateDoc(doc(db, 'userPrograms', programId), updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating program:', error);
      return { success: false, error };
    }
  },

  async deleteProgram(programId: string) {
    try {
      await deleteDoc(doc(db, 'userPrograms', programId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting program:', error);
      return { success: false, error };
    }
  },

  async getProgramsByFilters(filters: {
    level?: string;
    goal?: string;
    daysPerWeek?: number;
  }) {
    try {
      let q = collection(db, 'userPrograms');
      
      if (filters.level) {
        q = query(q, where('level', '==', filters.level));
      }
      if (filters.goal) {
        q = query(q, where('goal', '==', filters.goal));
      }
      if (filters.daysPerWeek) {
        q = query(q, where('daysPerWeek', '==', filters.daysPerWeek));
      }
      
      const querySnapshot = await getDocs(q);
      return {
        success: true,
        data: querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    } catch (error) {
      console.error('Error getting filtered programs:', error);
      return { success: false, error };
    }
  }
};

// Service pour les statistiques
export const statisticsService = {
  async getUserStatistics() {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => doc.data());
      
      return {
        success: true,
        data: {
          totalUsers: usersSnapshot.size,
          usersByLevel: this.groupBy(users, 'level'),
          usersByGoal: this.groupBy(users, 'goal'),
          usersByDiet: this.groupBy(users, 'diet'),
        }
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      return { success: false, error };
    }
  },

  async getContentStatistics() {
    try {
      const [exercisesSnapshot, recipesSnapshot, programsSnapshot] = await Promise.all([
        getDocs(collection(db, 'exercises')),
        getDocs(collection(db, 'recipes')),
        getDocs(collection(db, 'userPrograms'))
      ]);
      
      return {
        success: true,
        data: {
          totalExercises: exercisesSnapshot.size,
          totalRecipes: recipesSnapshot.size,
          totalPrograms: programsSnapshot.size,
        }
      };
    } catch (error) {
      console.error('Error getting content statistics:', error);
      return { success: false, error };
    }
  },

  async getWorkoutStatistics() {
    try {
      const workoutsSnapshot = await getDocs(collection(db, 'workouts'));
      const workouts = workoutsSnapshot.docs.map(doc => doc.data());
      
      const completedWorkouts = workouts.filter(w => w.completed);
      const totalWorkoutTime = workouts.reduce((acc, w) => acc + (w.duration || 0), 0);
      
      return {
        success: true,
        data: {
          totalWorkouts: workoutsSnapshot.size,
          completedWorkouts: completedWorkouts.length,
          averageWorkoutTime: workouts.length > 0 ? totalWorkoutTime / workouts.length : 0,
          completionRate: workouts.length > 0 ? (completedWorkouts.length / workouts.length) * 100 : 0,
        }
      };
    } catch (error) {
      console.error('Error getting workout statistics:', error);
      return { success: false, error };
    }
  },

  groupBy(array: any[], key: string) {
    return array.reduce((result, item) => {
      const group = item[key] || 'Non défini';
      result[group] = (result[group] || 0) + 1;
      return result;
    }, {});
  }
};