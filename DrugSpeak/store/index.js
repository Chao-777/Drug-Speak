import { configureStore } from '@reduxjs/toolkit';
import learningListReducer from './learningListSlice';

export const store = configureStore({
   reducer: {
      learningList: learningListReducer,
   }
});
