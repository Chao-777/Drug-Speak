import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   learningList: []
};

export const learningListSlice = createSlice({
   name: 'learningList',
   initialState,
   reducers: {
      addToLearningList: (state, action) => {
      if (!state.learningList.some(drug => drug.id === action.payload.id)) {
         state.learningList.push(action.payload);
      }
      },
      removeFromLearningList: (state, action) => {
         state.learningList = state.learningList.filter(
         drug => drug.id !== action.payload
         );
      }
   }
});

export const { addToLearningList, removeFromLearningList } = learningListSlice.actions;
export default learningListSlice.reducer;
