import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import learningListReducer from './learningListSlice';

const persistConfig = {
   key: 'root',
   storage: AsyncStorage,
   whitelist: ['learningList'] 
};

const rootReducer = combineReducers({
   learningList: learningListReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
   reducer: persistedReducer,
   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
         serializableCheck: {
         ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
         },
      }),
});

export const persistor = persistStore(store);
