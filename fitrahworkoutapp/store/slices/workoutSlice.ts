import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  completed: boolean;
  videoUrl?: string;
  description: string;
  tags: string[];
}

interface WorkoutState {
  currentProgram: Exercise[];
  currentDay: 'Push' | 'Pull' | 'Legs';
  completedExercises: string[];
  workoutStartTime: number | null;
  totalWorkoutTime: number;
  isWorkoutActive: boolean;
}

const initialState: WorkoutState = {
  currentProgram: [
    {
      id: '1',
      name: 'Pompes',
      sets: 3,
      reps: '8-12',
      completed: false,
      description: 'Exercice de base pour les pectoraux',
      tags: ['Push', 'Débutant'],
    },
    {
      id: '2',
      name: 'Développé couché',
      sets: 3,
      reps: '8-10',
      completed: false,
      description: 'Exercice principal pour le développement des pectoraux',
      tags: ['Push', 'Intermédiaire'],
    },
    {
      id: '3',
      name: 'Élévations latérales',
      sets: 3,
      reps: '12-15',
      completed: false,
      description: 'Isolation des deltoïdes latéraux',
      tags: ['Push', 'Débutant'],
    },
  ],
  currentDay: 'Push',
  completedExercises: [],
  workoutStartTime: null,
  totalWorkoutTime: 0,
  isWorkoutActive: false,
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    toggleExerciseCompletion: (state, action: PayloadAction<string>) => {
      const exercise = state.currentProgram.find(e => e.id === action.payload);
      if (exercise) {
        exercise.completed = !exercise.completed;
        if (exercise.completed) {
          state.completedExercises.push(exercise.id);
        } else {
          state.completedExercises = state.completedExercises.filter(id => id !== exercise.id);
        }
      }
    },
    startWorkout: (state) => {
      state.isWorkoutActive = true;
      state.workoutStartTime = Date.now();
    },
    endWorkout: (state) => {
      state.isWorkoutActive = false;
      if (state.workoutStartTime) {
        state.totalWorkoutTime = Date.now() - state.workoutStartTime;
      }
      state.workoutStartTime = null;
    },
    setCurrentDay: (state, action: PayloadAction<'Push' | 'Pull' | 'Legs'>) => {
      state.currentDay = action.payload;
      // Reset completion status for new day
      state.currentProgram.forEach(exercise => {
        exercise.completed = false;
      });
      state.completedExercises = [];
    },
  },
});

export const { toggleExerciseCompletion, startWorkout, endWorkout, setCurrentDay } = workoutSlice.actions;
export default workoutSlice.reducer;