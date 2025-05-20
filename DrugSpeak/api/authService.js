import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';
import { setCurrentUser, clearUserData } from '../store';
import LearningDataService from './learningDataService';
import AudioRecorderManager from '../services/AudioRecorderManager';

// Keys for data backup
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
         // First, ensure we're not in the middle of a logout
         await AsyncStorage.removeItem('isLoggingOut');
         await AsyncStorage.removeItem('finalSync');
         
         // Clear auth-specific keys to prepare for new login
         await AsyncStorage.removeItem('userToken');
         await AsyncStorage.removeItem('userData');
         
         // Make the API request
         const response = await apiClient.post('/auth/login', { email, password });
         const { user, token } = response.data;
         
         // Store credentials first
         await AsyncStorage.setItem('userToken', token);
         await AsyncStorage.setItem('userData', JSON.stringify(user));
         
         // Get user ID
         const userId = user.id || user._id;
         
         // Check for backed up learning data using LearningDataService
         try {
            // First check for data in our direct storage format
            const hasDirectData = await LearningDataService.hasLearningList(userId);
            if (!hasDirectData) {
               // Fall back to using backed up data if direct storage is empty
               const backupKey = `${BACKUP_LEARNING_DATA}_${userId}`;
               const backupData = await AsyncStorage.getItem(backupKey);
               
               if (backupData) {
                  // Store it with the proper user-prefixed key that Redux-Persist will use
                  const persistKey = `user_${userId}_persist:root`;
                  await AsyncStorage.setItem(persistKey, backupData);
               }
            }
         } catch (restoreError) {
            // Error handling for restore
         }
         
         // Then configure store for this user - this will LOAD existing data for this user
         await setCurrentUser(user.id || user._id);
         
         // Return the result immediately to complete the login flow
         // Data loading will happen afterwards in the background
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
         // Use the same endpoint as defined in your UserController
         const response = await apiClient.post('/users', userData);
         
         // According to your Swagger docs, this endpoint returns user and token
         const { user, token } = response.data;
         
         // Store the token for authenticated requests
         await AsyncStorage.setItem('userToken', token);
         // Store user data
         await AsyncStorage.setItem('userData', JSON.stringify(user));
         
         // Configure store for this new user
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
      
      // If there's a token, make sure the user ID is set in the store
      if (token) {
         const userData = await AuthService.getCurrentUser();
         if (userData && (userData.id || userData._id)) {
            // Set the user ID in the store without purging to avoid data loss
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
         // Cancel pending operations by setting a flag in AsyncStorage
         await AsyncStorage.setItem('isLoggingOut', 'true');
         
         // Give pending operations a moment to detect the logout flag and abort
         await new Promise(resolve => setTimeout(resolve, 3000));
         
         // IMPORTANT: Get current user before clearing auth data
         const userData = await AuthService.getCurrentUser();
         const userId = userData?.id || userData?._id;
         
         // Clear user recordings before logging out
         try {
            await AudioRecorderManager.clearUserRecordings();
         } catch (clearError) {
            console.error('Error clearing user recordings:', clearError);
         }
         
         // SAVE LEARNING DATA: Get current Redux state and save it
         try {
            if (userId) {
               // Import necessary Redux functions 
               const { store } = require('../store');
               const state = store.getState();
               
               if (state.learningList?.learningList?.length > 0) {
                  // Save using LearningDataService
                  await LearningDataService.saveLearningList(userId, state.learningList.learningList);
                  
                  // Also back up data for Redux-Persist format as a fallback
                  const backupKey = `${BACKUP_LEARNING_DATA}_${userId}`;
                  const persistKey = `user_${userId}_persist:root`;
                  const persistData = await AsyncStorage.getItem(persistKey);
                  if (persistData) {
                     await AsyncStorage.setItem(backupKey, persistData);
                  }
               }
            }
         } catch (saveError) {
            // Error handling for save
         }
         
         // Clear only authentication data, not user data
         await AsyncStorage.removeItem('userToken');
         await AsyncStorage.removeItem('userData');
         
         // Clear Redux store data - this will reset UI state but won't affect AsyncStorage data
         await clearUserData();
         
         // Clean up the flags
         await AsyncStorage.removeItem('isLoggingOut');
         await AsyncStorage.removeItem('finalSync');
         
         return true;
      } catch (error) {
         // Try again in case of error
         try {
            await clearUserData();
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            await AsyncStorage.removeItem('isLoggingOut');
            await AsyncStorage.removeItem('finalSync');
         } catch (secondError) {
            // Handle second error
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
         // Check for token first
         const token = await AsyncStorage.getItem('userToken');
         if (!token) {
            return null;
         }

         // Then get user data
         const userData = await AsyncStorage.getItem('userData');
         if (!userData) {
            return null;
         }
         
         try {
            return JSON.parse(userData);
         } catch (parseError) {
            await AsyncStorage.removeItem('userData'); // Clear corrupted data
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
    * @returns {Promise<Object|null>} Updated user data or null
    */
   refreshUserData: async () => {
      try {
         // Ensure user is logged in first
         const token = await AsyncStorage.getItem('userToken');
         if (!token) return null;
         
         // Fetch fresh user data from backend
         try {
            const response = await apiClient.get('/users/profile');
            const userData = response.data;
            
            // Update local cache
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            
            return userData;
         } catch (apiError) {
            // Check if this is a 404 error (endpoint not implemented yet)
            if (apiError.response?.status === 404) {
               // Return cached data as fallback without logging as error
               return AuthService.getCurrentUser();
            }
            // Rethrow other errors
            throw apiError;
         }
      } catch (error) {
         // Only log detailed error if it's not a 404
         if (error.response?.status !== 404) {
            console.error('Error refreshing user data:', error);
         }
         // Return cached data as fallback
         return AuthService.getCurrentUser();
      }
   },
   
   /**
    * Save user's email for easier future login
    * @param {string} email - User's email
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
    * @returns {Promise<string|null>} Last used email or null
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
         
         // Find and inspect learning data
         const reduxLearningKeys = keys.filter(key => 
            key.includes('persist:') || key.includes('learningList') || key.includes('user_')
         );
         
         // Also check for direct learning list keys
         const directLearningKeys = keys.filter(key => 
            key.includes(USER_LEARNING_LIST_KEY)
         );
         
         // Also show backup keys
         const backupKeys = keys.filter(key => key.includes(BACKUP_LEARNING_DATA));
         
         // Try to load a sample of the direct learning data
         if (directLearningKeys.length > 0) {
            for (const key of directLearningKeys) {
               try {
                  const data = await AsyncStorage.getItem(key);
                  if (data) {
                     JSON.parse(data);
                  }
               } catch (e) {
                  // Error handling
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
