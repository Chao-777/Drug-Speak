import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import learningListReducer from './learningListSlice';
import { createAction } from '@reduxjs/toolkit';

// Action to clear store on logout
export const clearStoreData = createAction('root/clearStoreData');

// Create a custom storage object that prefixes keys with user ID
const createUserStorage = () => {
  let userId = null;
  
  return {
    setUserId: (id) => {
      const previousId = userId;
      userId = id;
      
      // Return whether the ID changed
      return previousId !== id;
    },
    getUserId: () => {
      return userId;
    },
    getItem: async (key) => {
      const prefixedKey = userId ? `user_${userId}_${key}` : key;
      const value = await AsyncStorage.getItem(prefixedKey);
      return value;
    },
    setItem: async (key, value) => {
      const prefixedKey = userId ? `user_${userId}_${key}` : key;
      await AsyncStorage.setItem(prefixedKey, value);
    },
    removeItem: async (key) => {
      const prefixedKey = userId ? `user_${userId}_${key}` : key;
      await AsyncStorage.removeItem(prefixedKey);
    }
  };
};

export const userStorage = createUserStorage();

// Configure persistence with user storage
const persistConfig = {
   key: 'root',
   storage: userStorage,
   whitelist: ['learningList'] 
};

// Create an appReducer that can be cleared on logout
const appReducer = combineReducers({
   learningList: learningListReducer,
});

// Root reducer that can clear all data on logout
const rootReducer = (state, action) => {
  // When logout action is dispatched, reset state
  if (action.type === clearStoreData.type) {
    return appReducer(undefined, action);
  }
  
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
   reducer: persistedReducer,
   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
         serializableCheck: {
           ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
         },
      }),
});

export const persistor = persistStore(store);

// Function to update the current user in storage and clear/reload data
export const setCurrentUser = async (userId) => {
  if (!userId) {
    return false;
  }
  
  // Set the user ID in the storage adapter
  const previousUserId = userStorage.getUserId();
  const userChanged = userStorage.setUserId(userId);
  
  if (userChanged) {
    // If user changed, we want to reset in-memory state but keep AsyncStorage data
    // First purge the current in-memory store
    await persistor.purge();
    
    // Dispatch action to clear in-memory Redux state
    store.dispatch(clearStoreData());
  }
  
  // Persist with the new user context - this will load data from AsyncStorage
  try {
    persistor.persist();
  } catch (error) {
    console.error('Error persisting store:', error);
  }
  
  return true;
};

// Function to clear user data on logout
export const clearUserData = async () => {
  // Dispatch action to clear Redux state
  store.dispatch(clearStoreData());
  
  // Clear persisted data from memory only, don't remove from AsyncStorage
  await persistor.purge();
  
  // Reset user ID in storage to null
  userStorage.setUserId(null);
  
  return true;
};
