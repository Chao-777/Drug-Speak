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
            const drugWithStatus = {
               ...action.payload,
               status: 'current' 
            };
            state.learningList.push(drugWithStatus);
         }
      },
      removeFromLearningList: (state, action) => {
         state.learningList = state.learningList.filter(
            drug => drug.id !== action.payload
         );
      },
      updateLearningStatus: (state, action) => {
         const { id, status } = action.payload;
         const drugIndex = state.learningList.findIndex(drug => drug.id === id);
         if (drugIndex !== -1) {
            state.learningList[drugIndex].status = status;
         }
      }
   }
});

export const { 
   addToLearningList, 
   removeFromLearningList,
   updateLearningStatus 
} = learningListSlice.actions;

export default learningListSlice.reducer;
