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
      console.log('Storage user ID set to:', id || 'none (using default)');
      
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
    console.log('Clearing Redux store data');
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
  console.log('Setting current user to:', userId);
  
  if (!userId) {
    console.log('No user ID provided, skipping user setup');
    return false;
  }
  
  // Set the user ID in the storage adapter
  const previousUserId = userStorage.getUserId();
  const userChanged = userStorage.setUserId(userId);
  console.log(`User ID changed: ${userChanged} (${previousUserId || 'none'} -> ${userId})`);
  
  if (userChanged) {
    // If user changed, we want to reset in-memory state but keep AsyncStorage data
    console.log(`User changed to ${userId}, loading their data`);

    // First purge the current in-memory store
    await persistor.purge();
    
    // Dispatch action to clear in-memory Redux state
    store.dispatch(clearStoreData());
  }
  
  // Persist with the new user context - this will load data from AsyncStorage
  try {
    console.log(`Rehydrating store for user ${userId}`);
    persistor.persist();
  } catch (error) {
    console.error('Error persisting store:', error);
  }
  
  console.log('Store configured for user:', userId || 'none (default)');
  return true;
};

// Function to clear user data on logout
export const clearUserData = async () => {
  // Dispatch action to clear Redux state
  console.log('Dispatching clearStoreData action');
  store.dispatch(clearStoreData());
  
  // Clear persisted data from memory only, don't remove from AsyncStorage
  console.log('Purging persistor from memory');
  await persistor.purge();
  
  // Reset user ID in storage to null
  console.log('Resetting user ID in storage');
  userStorage.setUserId(null);
  
  // Don't recreate the store immediately - this will happen on next login
  
  console.log('User data cleared from memory store');
  return true;
};
