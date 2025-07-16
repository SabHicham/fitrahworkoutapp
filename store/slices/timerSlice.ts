import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TimerState {
  duration: number; // in seconds
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
  presetTimes: number[];
}

const initialState: TimerState = {
  duration: 60,
  timeRemaining: 60,
  isActive: false,
  isPaused: false,
  presetTimes: [30, 60, 90, 120, 180, 300], // 30s, 1min, 1.5min, 2min, 3min, 5min
};

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
      state.timeRemaining = action.payload;
    },
    startTimer: (state) => {
      state.isActive = true;
      state.isPaused = false;
    },
    pauseTimer: (state) => {
      state.isPaused = true;
    },
    resetTimer: (state) => {
      state.isActive = false;
      state.isPaused = false;
      state.timeRemaining = state.duration;
    },
    tick: (state) => {
      if (state.isActive && !state.isPaused && state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      }
      if (state.timeRemaining === 0) {
        state.isActive = false;
      }
    },
  },
});

export const { setDuration, startTimer, pauseTimer, resetTimer, tick } = timerSlice.actions;
export default timerSlice.reducer;