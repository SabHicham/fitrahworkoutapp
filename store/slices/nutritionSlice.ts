import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Meal {
  id: string;
  name: string;
  type: 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Collation';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  cookTime: number;
  dietTags: string[];
  seasonal: boolean;
}

interface NutritionState {
  dailyMeals: Meal[];
  totalCalories: number;
  targetCalories: number;
  shoppingList: string[];
  replacementHistory: string[];
}

const initialState: NutritionState = {
  dailyMeals: [],
  totalCalories: 0,
  targetCalories: 2000,
  shoppingList: [],
  replacementHistory: [],
};

const nutritionSlice = createSlice({
  name: 'nutrition',
  initialState,
  reducers: {
    setDailyMeals: (state, action: PayloadAction<Meal[]>) => {
      state.dailyMeals = action.payload;
      state.totalCalories = action.payload.reduce((total, meal) => total + meal.calories, 0);
    },
    replaceMeal: (state, action: PayloadAction<{ mealId: string; newMeal: Meal }>) => {
      const index = state.dailyMeals.findIndex(meal => meal.id === action.payload.mealId);
      if (index !== -1) {
        state.replacementHistory.push(state.dailyMeals[index].id);
        state.dailyMeals[index] = action.payload.newMeal;
        state.totalCalories = state.dailyMeals.reduce((total, meal) => total + meal.calories, 0);
      }
    },
    generateShoppingList: (state) => {
      const allIngredients = state.dailyMeals.flatMap(meal => meal.ingredients);
      state.shoppingList = [...new Set(allIngredients)];
    },
    updateTargetCalories: (state, action: PayloadAction<number>) => {
      state.targetCalories = action.payload;
    },
    clearNutritionData: (state) => {
      state.dailyMeals = [];
      state.totalCalories = 0;
      state.shoppingList = [];
      state.replacementHistory = [];
    },
  },
});

export const { 
  setDailyMeals, 
  replaceMeal, 
  generateShoppingList, 
  updateTargetCalories, 
  clearNutritionData 
} = nutritionSlice.actions;

export default nutritionSlice.reducer;