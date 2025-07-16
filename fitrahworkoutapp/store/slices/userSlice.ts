import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { dateUtils } from '@/utils/dateUtils';

interface UserState {
  isOnboarded: boolean;
  isProfileLoading: boolean;
  name: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  goal: 'Perdre du poids' | 'Prise de muscle' | 'Performance';
  diet: 'Standard' | 'Végétarien' | 'Vegan' | 'Sans gluten' | 'Autre';
  selectedDays: string[];
  daysPerWeek: number;
  age: number;
  height: number;
  weight: number;
  badges: string[];
  achievements: Achievement[];
  disciplineScore: number;
  consumedCalories: number;
  // Dates as ISO strings for serialization
  createdAt?: string;
  updatedAt?: string;
  email?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'Argent' | 'Or' | 'Diamant';
  progress: number;
  target: number;
  unlocked: boolean;
}

const initialState: UserState = {
  isOnboarded: false,
  isProfileLoading: true,
  name: '',
  level: 'Débutant',
  goal: 'Perdre du poids',
  diet: 'Standard',
  selectedDays: ['monday', 'wednesday', 'friday'],
  daysPerWeek: 3,
  age: 25,
  height: 170,
  weight: 70,
  badges: [],
  consumedCalories: 0,
  achievements: [
    {
      id: '1',
      name: 'Badge Argent',
      description: '20 tractions',
      type: 'Argent',
      progress: 14,
      target: 20,
      unlocked: false,
    },
    {
      id: '2',
      name: 'Badge Or',
      description: '10 muscle-ups',
      type: 'Or',
      progress: 3,
      target: 10,
      unlocked: false,
    },
    {
      id: '3',
      name: 'Badge Diamant',
      description: 'Combo complet',
      type: 'Diamant',
      progress: 0,
      target: 1,
      unlocked: false,
    },
  ],
  disciplineScore: 85,
};


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<Partial<UserState>>) => {
      // Serialize any dates before storing using safe utility
      const serializedData = dateUtils.serializeObjectDates({
        ...action.payload,
        updatedAt: new Date().toISOString()
      });
      return { ...state, ...serializedData };
    },
    setProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.isProfileLoading = action.payload;
    },
    updateAchievementProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const achievement = state.achievements.find(a => a.id === action.payload.id);
      if (achievement) {
        achievement.progress = action.payload.progress;
        if (achievement.progress >= achievement.target) {
          achievement.unlocked = true;
          state.badges.push(achievement.type);
        }
      }
      // Update timestamp
      state.updatedAt = new Date().toISOString();
    },
    updateDisciplineScore: (state, action: PayloadAction<number>) => {
      state.disciplineScore = action.payload;
      state.updatedAt = new Date().toISOString();
    },
    updateConsumedCalories: (state, action: PayloadAction<number>) => {
      // Si c'est une valeur positive, on ajoute. Si c'est négatif, on soustrait
      state.consumedCalories = Math.max(0, state.consumedCalories + action.payload);
      state.updatedAt = new Date().toISOString();
    },
    updateUserState: (state, action: PayloadAction<Partial<UserState>>) => {
      const serializedData = dateUtils.serializeObjectDates(action.payload);
      Object.assign(state, serializedData);
      state.updatedAt = new Date().toISOString();
    },
  },
});

export const { setUserData, setProfileLoading, updateAchievementProgress, updateDisciplineScore, updateConsumedCalories, updateUserState } = userSlice.actions;
export default userSlice.reducer;