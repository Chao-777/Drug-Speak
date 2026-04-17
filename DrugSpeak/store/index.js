import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import learningListReducer from './learningListSlice';
import { createAction } from '@reduxjs/toolkit';

export const clearStoreData = createAction('root/clearStoreData');

const createUserStorage = () => {
  let userId = null;
  
  return {
    setUserId: (id) => {
      const previousId = userId;
      userId = id;
      
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

const persistConfig = {
  key: 'root',
  storage: userStorage,
  whitelist: ['learningList'] 
};

const appReducer = combineReducers({
  learningList: learningListReducer,
});

const rootReducer = (state, action) => {
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

export const setCurrentUser = async (userId) => {
  if (!userId) {
    return false;
  }
  
  const previousUserId = userStorage.getUserId();
  const userChanged = userStorage.setUserId(userId);
  
  if (userChanged) {
    await persistor.purge();
    
    store.dispatch(clearStoreData());
  }
  
  try {
    persistor.persist();
  } catch (error) {
    console.error('Error persisting store:', error);
  }
  
  return true;
};

export const clearUserData = async () => {
  store.dispatch(clearStoreData());
  
  await persistor.purge();
  
  userStorage.setUserId(null);
  
  return true;
};
