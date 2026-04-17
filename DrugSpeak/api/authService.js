import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';
import { setCurrentUser, clearUserData } from '../store';
import LearningDataService from './learningDataService';
import AudioRecorderManager from '../services/AudioRecorderManager';

const BACKUP_LEARNING_DATA = 'backup_learning_data';

const AuthService = {
   /**
    * Login a user with email and password
    * @param {string} email - User's email
    * @param {string} password - User's password
    * @returns {Promise<Object>} User data and token
    */
   login: async (email, password) => {
      try {
         await AsyncStorage.removeItem('isLoggingOut');
         await AsyncStorage.removeItem('finalSync');
         
         await AsyncStorage.removeItem('userToken');
         await AsyncStorage.removeItem('userData');
         
         const response = await apiClient.post('/auth/login', { email, password });
         const { user, token } = response.data;
         
         await AsyncStorage.setItem('userToken', token);
         await AsyncStorage.setItem('userData', JSON.stringify(user));
         
         const userId = user.id || user._id;
         
         try {
            const hasDirectData = await LearningDataService.hasLearningList(userId);
            if (!hasDirectData) {
               const backupKey = `${BACKUP_LEARNING_DATA}_${userId}`;
               const backupData = await AsyncStorage.getItem(backupKey);
               
               if (backupData) {
                  const persistKey = `user_${userId}_persist:root`;
                  await AsyncStorage.setItem(persistKey, backupData);
               }
            }
         } catch (restoreError) {
         }
         
         await setCurrentUser(user.id || user._id);
         
         return { user, token };
      } catch (error) {
         if (error.response?.status === 401) {
            throw new Error('Invalid email or password');
         } else {
            throw new Error('Something went wrong. Please try again.');
         }
      }
   },
   
   /**
    * Register a new user
    * @param {Object} userData - User registration data
    * @returns {Promise<Object>} Registered user data and token
    */
   register: async (userData) => {
      try {
         const response = await apiClient.post('/users', userData);
         
         const { user, token } = response.data;
         
         await AsyncStorage.setItem('userToken', token);
         await AsyncStorage.setItem('userData', JSON.stringify(user));
         
         await setCurrentUser(user.id || user._id);
         
         return response.data;
      } catch (error) {
         if (error.response?.status === 409) {
            throw new Error('Email already in use.');
         } else if (error.response?.status === 400) {
            throw new Error('Invalid input. Please check all fields.');
         } else {
            throw new Error('An error occurred during signup.');
         }
      }
   },
   
   /**
    * Check if user is currently logged in
    * @returns {Promise<boolean>} Whether user is logged in
    */
   isLoggedIn: async () => {
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
         const userData = await AuthService.getCurrentUser();
         if (userData && (userData.id || userData._id)) {
            await setCurrentUser(userData.id || userData._id);
         }
      }
      
      return !!token;
   },
   
   /**
    * Logout the current user
    * @returns {Promise<boolean>} Success status
    */
   logout: async () => {
      try {
         await AsyncStorage.setItem('isLoggingOut', 'true');
         
         await new Promise(resolve => setTimeout(resolve, 3000));
         
         const userData = await AuthService.getCurrentUser();
         const userId = userData?.id || userData?._id;
         
         try {
            await AudioRecorderManager.clearUserRecordings();
         } catch (clearError) {
            console.error('Error clearing user recordings:', clearError);
         }
         
         try {
            if (userId) {
               const { store } = require('../store');
               const state = store.getState();
               
               if (state.learningList?.learningList?.length > 0) {
                  await LearningDataService.saveLearningList(userId, state.learningList.learningList);
                  
                  const backupKey = `${BACKUP_LEARNING_DATA}_${userId}`;
                  const persistKey = `user_${userId}_persist:root`;
                  const persistData = await AsyncStorage.getItem(persistKey);
                  if (persistData) {
                     await AsyncStorage.setItem(backupKey, persistData);
                  }
               }
            }
         } catch (saveError) {
         }
         
         await AsyncStorage.removeItem('userToken');
         await AsyncStorage.removeItem('userData');
         
         await clearUserData();
         
         await AsyncStorage.removeItem('isLoggingOut');
         await AsyncStorage.removeItem('finalSync');
         
         return true;
      } catch (error) {
         try {
            await clearUserData();
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            await AsyncStorage.removeItem('isLoggingOut');
            await AsyncStorage.removeItem('finalSync');
         } catch (secondError) {
         }
         return false;
      }
   },
   
   /**
    * Get current user data from AsyncStorage
    * @returns {Promise<Object|null>} User data or null
    */
   getCurrentUser: async () => {
      try {
         const token = await AsyncStorage.getItem('userToken');
         if (!token) {
            return null;
         }

         const userData = await AsyncStorage.getItem('userData');
         if (!userData) {
            return null;
         }
         
         try {
            return JSON.parse(userData);
         } catch (parseError) {
            await AsyncStorage.removeItem('userData'); 
            return null;
         }
      } catch (error) {
         return null;
      }
   },
   
   /**
    * Update current user data in AsyncStorage
    * @param {Object} userData - Updated user data
    * @returns {Promise<void>}
    */
   updateCurrentUser: async (userData) => {
      try {
         await AsyncStorage.setItem('userData', JSON.stringify(userData));
      } catch (error) {
         throw new Error('Failed to update user data in storage');
      }
   },
   
   /**
    * Refresh user data from backend
    * @returns {Promise<Object|null>}
    */
   refreshUserData: async () => {
      try {
         const token = await AsyncStorage.getItem('userToken');
         if (!token) return null;
         
         try {
            const response = await apiClient.get('/users/profile');
            const userData = response.data;
            
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            
            return userData;
         } catch (apiError) {
            if (apiError.response?.status === 404) {
               return AuthService.getCurrentUser();
            }
            throw apiError;
         }
      } catch (error) {
         if (error.response?.status !== 404) {
            console.error('Error refreshing user data:', error);
         }
         return AuthService.getCurrentUser();
      }
   },
   
   /**
    * Save user's email for easier future login
    * @param {string} email 
    * @returns {Promise<void>}
    */
   saveLastEmail: async (email) => {
      try {
         await AsyncStorage.setItem('lastEmail', email);
      } catch (error) {
         console.error('Error saving last email:', error);
      }
   },
   
   /**
    * Get user's last used email
    * @returns {Promise<string|null>}
    */
   getLastEmail: async () => {
      try {
         return await AsyncStorage.getItem('lastEmail');
      } catch (error) {
         console.error('Error getting last email:', error);
         return null;
      }
   },
   
   /**
    * Diagnostic function to check AsyncStorage content
    */
   inspectStorage: async () => {
      try {
         const keys = await AsyncStorage.getAllKeys();
         
         const reduxLearningKeys = keys.filter(key => 
            key.includes('persist:') || key.includes('learningList') || key.includes('user_')
         );
         
         const directLearningKeys = keys.filter(key => 
            key.includes(USER_LEARNING_LIST_KEY)
         );
         
         const backupKeys = keys.filter(key => key.includes(BACKUP_LEARNING_DATA));
         
         if (directLearningKeys.length > 0) {
            for (const key of directLearningKeys) {
               try {
                  const data = await AsyncStorage.getItem(key);
                  if (data) {
                     JSON.parse(data);
                  }
               } catch (e) {
               }
            }
         }
         
         return {
            allKeys: keys,
            reduxLearningKeys,
            directLearningKeys,
            backupKeys
         };
      } catch (error) {
         return null;
      }
   },
};

export default AuthService;
