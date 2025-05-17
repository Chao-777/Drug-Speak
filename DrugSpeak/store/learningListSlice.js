import { createSlice, createAction } from '@reduxjs/toolkit';

const initialState = {
   learningList: []
};
export const updateDrugScore = createAction('learningList/updateDrugScore');

export const learningListSlice = createSlice({
   name: 'learningList',
   initialState,
   reducers: {
      setLearningList: (state, action) => {
         // Replace entire learning list with provided data
         state.learningList = action.payload;
      },
      addToLearningList: (state, action) => {
         if (!state.learningList.some(drug => drug.id === action.payload.id)) {
            const drugWithStatus = {
               ...action.payload,
               status: 'current',
               score: 0  // Initialize with zero score
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
   },
   extraReducers: (builder) => {
      // Handle the updateDrugScore action
      builder.addCase(updateDrugScore, (state, action) => {
         const { id, score } = action.payload;
         const drugIndex = state.learningList.findIndex(drug => drug.id === id);
         
         if (drugIndex !== -1) {
            // Only update if new score is higher than current score
            if (!state.learningList[drugIndex].score || 
                  score > state.learningList[drugIndex].score) {
               state.learningList[drugIndex].score = score;
            }
         }
      });
   }
});

export const { 
   setLearningList,
   addToLearningList, 
   removeFromLearningList,
   updateLearningStatus 
} = learningListSlice.actions;

export default learningListSlice.reducer;
