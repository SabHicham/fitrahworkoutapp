import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl: string;
  category: 'Push' | 'Pull' | 'Legs' | 'Cardio' | 'Core';
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  equipment: 'Poids du corps' | 'Haltères' | 'Barre' | 'Machine' | 'Élastiques';
  muscleGroups: string[];
  sets: number;
  reps: string;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string;
  cookTime: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  season: 'Toute l\'année' | 'Printemps' | 'Été' | 'Automne' | 'Hiver';
  diet: 'Standard' | 'Végétarien' | 'Vegan' | 'Sans gluten';
  goal: 'Perte de poids' | 'Prise de muscle' | 'Performance' | 'Universel';
  mealType: 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Collation';
}

interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  goal: 'Perte de poids' | 'Prise de muscle' | 'Performance';
  daysPerWeek: number;
  duration: number;
  sessions: any[];
}

interface AdminState {
  exercises: Exercise[];
  recipes: Recipe[];
  programs: WorkoutProgram[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  exercises: [],
  recipes: [],
  programs: [],
  isLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setExercises: (state, action: PayloadAction<Exercise[]>) => {
      state.exercises = action.payload;
    },
    addExercise: (state, action: PayloadAction<Exercise>) => {
      state.exercises.push(action.payload);
    },
    updateExercise: (state, action: PayloadAction<Exercise>) => {
      const index = state.exercises.findIndex(ex => ex.id === action.payload.id);
      if (index !== -1) {
        state.exercises[index] = action.payload;
      }
    },
    removeExercise: (state, action: PayloadAction<string>) => {
      state.exercises = state.exercises.filter(ex => ex.id !== action.payload);
    },
    setRecipes: (state, action: PayloadAction<Recipe[]>) => {
      state.recipes = action.payload;
    },
    addRecipe: (state, action: PayloadAction<Recipe>) => {
      state.recipes.push(action.payload);
    },
    updateRecipe: (state, action: PayloadAction<Recipe>) => {
      const index = state.recipes.findIndex(recipe => recipe.id === action.payload.id);
      if (index !== -1) {
        state.recipes[index] = action.payload;
      }
    },
    removeRecipe: (state, action: PayloadAction<string>) => {
      state.recipes = state.recipes.filter(recipe => recipe.id !== action.payload);
    },
    setPrograms: (state, action: PayloadAction<WorkoutProgram[]>) => {
      state.programs = action.payload;
    },
    addProgram: (state, action: PayloadAction<WorkoutProgram>) => {
      state.programs.push(action.payload);
    },
    updateProgram: (state, action: PayloadAction<WorkoutProgram>) => {
      const index = state.programs.findIndex(program => program.id === action.payload.id);
      if (index !== -1) {
        state.programs[index] = action.payload;
      }
    },
    removeProgram: (state, action: PayloadAction<string>) => {
      state.programs = state.programs.filter(program => program.id !== action.payload);
    },
  },
});

export const {
  setLoading,
  setError,
  setExercises,
  addExercise,
  updateExercise,
  removeExercise,
  setRecipes,
  addRecipe,
  updateRecipe,
  removeRecipe,
  setPrograms,
  addProgram,
  updateProgram,
  removeProgram,
} = adminSlice.actions;

export default adminSlice.reducer;