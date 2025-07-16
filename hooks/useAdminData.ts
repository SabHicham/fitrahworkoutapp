import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  setExercises, 
  setRecipes, 
  setPrograms, 
  setLoading, 
  setError 
} from '@/store/slices/adminSlice';
import { 
  exerciseService, 
  recipeService, 
  programService, 
  statisticsService 
} from '@/services/adminService';

// Hook pour la gestion des exercices
export function useExercises() {
  const dispatch = useDispatch();
  const { exercises, isLoading, error } = useSelector((state: RootState) => state.admin);

  const loadExercises = async () => {
    dispatch(setLoading(true));
    const result = await exerciseService.getAllExercises();
    
    if (result.success) {
      dispatch(setExercises(result.data));
    } else {
      dispatch(setError('Erreur lors du chargement des exercices'));
    }
    
    dispatch(setLoading(false));
  };

  const createExercise = async (exerciseData: any) => {
    dispatch(setLoading(true));
    const result = await exerciseService.createExercise(exerciseData);
    
    if (result.success) {
      await loadExercises(); // Recharger la liste
    } else {
      dispatch(setError('Erreur lors de la création de l\'exercice'));
    }
    
    dispatch(setLoading(false));
    return result;
  };

  const updateExercise = async (exerciseId: string, updates: any) => {
    dispatch(setLoading(true));
    const result = await exerciseService.updateExercise(exerciseId, updates);
    
    if (result.success) {
      await loadExercises(); // Recharger la liste
    } else {
      dispatch(setError('Erreur lors de la mise à jour de l\'exercice'));
    }
    
    dispatch(setLoading(false));
    return result;
  };

  const deleteExercise = async (exerciseId: string) => {
    dispatch(setLoading(true));
    const result = await exerciseService.deleteExercise(exerciseId);
    
    if (result.success) {
      await loadExercises(); // Recharger la liste
    } else {
      dispatch(setError('Erreur lors de la suppression de l\'exercice'));
    }
    
    dispatch(setLoading(false));
    return result;
  };

  const getFilteredExercises = async (filters: any) => {
    dispatch(setLoading(true));
    const result = await exerciseService.getExercisesByFilters(filters);
    
    if (result.success) {
      dispatch(setExercises(result.data));
    } else {
      dispatch(setError('Erreur lors du filtrage des exercices'));
    }
    
    dispatch(setLoading(false));
    return result;
  };

  useEffect(() => {
    loadExercises();
  }, []);

  return {
    exercises,
    isLoading,
    error,
    loadExercises,
    createExercise,
    updateExercise,
    deleteExercise,
    getFilteredExercises,
  };
}

// Hook pour la gestion des recettes
export function useRecipes() {
  const dispatch = useDispatch();
  const { recipes, isLoading, error } = useSelector((state: RootState) => state.admin);

  const loadRecipes = async () => {
    dispatch(setLoading(true));
    const result = await recipeService.getAllRecipes();
    
    if (result.success) {
      dispatch(setRecipes(result.data));
    } else {
      dispatch(setError('Erreur lors du chargement des recettes'));
    }
    
    dispatch(setLoading(false));
  };

  const createRecipe = async (recipeData: any) => {
    dispatch(setLoading(true));
    const result = await recipeService.createRecipe(recipeData);
    
    if (result.success) {
      await loadRecipes(); // Recharger la liste
    } else {
      dispatch(setError('Erreur lors de la création de la recette'));
    }
    
    dispatch(setLoading(false));
    return result;
  };

  const updateRecipe = async (recipeId: string, updates: any) => {
    dispatch(setLoading(true));
    const result = await recipeService.updateRecipe(recipeId, updates);
    
    if (result.success) {
      await loadRecipes(); // Recharger la liste
    } else {
      dispatch(setError('Erreur lors de la mise à jour de la recette'));
    }
    
    dispatch(setLoading(false));
    return result;
  };

  const deleteRecipe = async (recipeId: string) => {
    dispatch(setLoading(true));
    const result = await recipeService.deleteRecipe(recipeId);
    
    if (result.success) {
      await loadRecipes(); // Recharger la liste
    } else {
      dispatch(setError('Erreur lors de la suppression de la recette'));
    }
    
    dispatch(setLoading(false));
    return result;
  };

  const getFilteredRecipes = async (filters: any) => {
    dispatch(setLoading(true));
    const result = await recipeService.getRecipesByFilters(filters);
    
    if (result.success) {
      dispatch(setRecipes(result.data));
    } else {
      dispatch(setError('Erreur lors du filtrage des recettes'));
    }
    
    dispatch(setLoading(false));
    return result;
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  return {
    recipes,
    isLoading,
    error,
    loadRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    getFilteredRecipes,
  };
}

// Hook pour la gestion des programmes
export function usePrograms() {
  const dispatch = useDispatch();
  const { programs, isLoading, error } = useSelector((state: RootState) => state.admin);

  const loadPrograms = async () => {
    dispatch(setLoading(true));
    const result = await programService.getAllPrograms();
    
    if (result.success) {
      dispatch(setPrograms(result.data));
    } else {
      dispatch(setError('Erreur lors du chargement des programmes'));
    }
    
    dispatch(setLoading(false));
  };

  const createProgram = async (programData: any) => {
    dispatch(setLoading(true));
    const result = await programService.createProgram(programData);
    
    if (result.success) {
      await loadPrograms(); // Recharger la liste
    } else {
      dispatch(setError('Erreur lors de la création du programme'));
    }
    
    dispatch(setLoading(false));
    return result;
  };

  const updateProgram = async (programId: string, updates: any) => {
    dispatch(setLoading(true));
    const result = await programService.updateProgram(programId, updates);
    
    if (result.success) {
      await loadPrograms(); // Recharger la liste
    } else {
      dispatch(setError('Erreur lors de la mise à jour du programme'));
    }
    
    dispatch(setLoading(false));
    return result;
  };

  const deleteProgram = async (programId: string) => {
    dispatch(setLoading(true));
    const result = await programService.deleteProgram(programId);
    
    if (result.success) {
      await loadPrograms(); // Recharger la liste
    } else {
      dispatch(setError('Erreur lors de la suppression du programme'));
    }
    
    dispatch(setLoading(false));
    return result;
  };

  const getFilteredPrograms = async (filters: any) => {
    dispatch(setLoading(true));
    const result = await programService.getProgramsByFilters(filters);
    
    if (result.success) {
      dispatch(setPrograms(result.data));
    } else {
      dispatch(setError('Erreur lors du filtrage des programmes'));
    }
    
    dispatch(setLoading(false));
    return result;
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  return {
    programs,
    isLoading,
    error,
    loadPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
    getFilteredPrograms,
  };
}

// Hook pour les statistiques
export function useStatistics() {
  const [statistics, setStatistics] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [userStats, contentStats, workoutStats] = await Promise.all([
        statisticsService.getUserStatistics(),
        statisticsService.getContentStatistics(),
        statisticsService.getWorkoutStatistics(),
      ]);
      
      if (userStats.success && contentStats.success && workoutStats.success) {
        setStatistics({
          ...userStats.data,
          ...contentStats.data,
          ...workoutStats.data,
        });
      } else {
        setError('Erreur lors du chargement des statistiques');
      }
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  return {
    statistics,
    isLoading,
    error,
    loadStatistics,
  };
}