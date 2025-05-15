import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import learningListReducer from './learningListSlice';

// Configuration for redux-persist
const persistConfig = {
   key: 'root',
   storage: AsyncStorage,
   whitelist: ['learningList'] // Only persist learningList state
};

// Combine reducers
const rootReducer = combineReducers({
   learningList: learningListReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store with persisted reducer
export const store = configureStore({
   reducer: persistedReducer,
   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
         serializableCheck: {
         // Ignore these action types in serializability check
         ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
         },
      }),
});

// Create persistor
export const persistor = persistStore(store);
