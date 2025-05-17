import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';
import { setCurrentUser, clearUserData } from '../store';
import LearningDataService from './learningDataService';

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
         console.log(`Attempting to login with email: ${email}`);
         
         // First, ensure we're not in the middle of a logout
         await AsyncStorage.removeItem('isLoggingOut');
         await AsyncStorage.removeItem('finalSync');
         
         // Clear auth-specific keys to prepare for new login
         await AsyncStorage.removeItem('userToken');
         await AsyncStorage.removeItem('userData');
         
         // Make the API request
         const response = await apiClient.post('/auth/login', { email, password });
         const { user, token } = response.data;
         
         console.log(`Login successful for user: ${user.id || user._id}`);
         
         // Store credentials first
         await AsyncStorage.setItem('userToken', token);
         await AsyncStorage.setItem('userData', JSON.stringify(user));
         
         // Get user ID
         const userId = user.id || user._id;
         
         // Check for backed up learning data using LearningDataService
         try {
            // First check for data in our direct storage format
            const hasDirectData = await LearningDataService.hasLearningList(userId);
            if (hasDirectData) {
               console.log(`Found learning data for user ${userId} in direct storage`);
               // The data will be loaded when needed by screens
            } else {
               // Fall back to using backed up data if direct storage is empty
               console.log(`Checking backup data for user ${userId}`);
               const backupKey = `${BACKUP_LEARNING_DATA}_${userId}`;
               const backupData = await AsyncStorage.getItem(backupKey);
               
               if (backupData) {
                  console.log(`Found backed up learning data for user ${userId}, restoring...`);
                  // Store it with the proper user-prefixed key that Redux-Persist will use
                  const persistKey = `user_${userId}_persist:root`;
                  await AsyncStorage.setItem(persistKey, backupData);
                  console.log('Backed up learning data restored successfully');
               }
            }
         } catch (restoreError) {
            console.error('Error restoring learning data:', restoreError);
         }
         
         // Then configure store for this user - this will LOAD existing data for this user
         await setCurrentUser(user.id || user._id);
         
         console.log('Login successful, token and user data stored');
         
         // Return the result immediately to complete the login flow
         // Data loading will happen afterwards in the background
         return { user, token };
      } catch (error) {
         console.error('Login error:', error);
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
         console.log('Starting logout process');
         
         // Cancel pending operations by setting a flag in AsyncStorage
         await AsyncStorage.setItem('isLoggingOut', 'true');
         
         // Give pending operations a moment to detect the logout flag and abort
         console.log('Allowing time for pending operations to complete...');
         await new Promise(resolve => setTimeout(resolve, 3000));
         
         // IMPORTANT: Get current user before clearing auth data
         const userData = await AuthService.getCurrentUser();
         const userId = userData?.id || userData?._id;
         console.log('Logging out user:', userId || 'unknown');
         
         // SAVE LEARNING DATA: Get current Redux state and save it
         try {
            if (userId) {
               // Import necessary Redux functions 
               const { store } = require('../store');
               const state = store.getState();
               
               if (state.learningList?.learningList?.length > 0) {
                  console.log(`Saving learning data for user ${userId} before logout`);
                  
                  // Save using LearningDataService
                  await LearningDataService.saveLearningList(userId, state.learningList.learningList);
                  console.log(`Saved ${state.learningList.learningList.length} learning items for user ${userId}`);
                  
                  // Also back up data for Redux-Persist format as a fallback
                  const backupKey = `${BACKUP_LEARNING_DATA}_${userId}`;
                  const persistKey = `user_${userId}_persist:root`;
                  const persistData = await AsyncStorage.getItem(persistKey);
                  if (persistData) {
                     await AsyncStorage.setItem(backupKey, persistData);
                     console.log('Learning data backed up for future sessions');
                  }
               }
            }
         } catch (saveError) {
            console.error('Error saving learning data before logout:', saveError);
         }
         
         // Clear only authentication data, not user data
         await AsyncStorage.removeItem('userToken');
         await AsyncStorage.removeItem('userData');
         console.log('Authentication tokens removed');
         
         // Clear Redux store data - this will reset UI state but won't affect AsyncStorage data
         await clearUserData();
         console.log('Redux store data cleared');
         
         // Clean up the flags
         await AsyncStorage.removeItem('isLoggingOut');
         await AsyncStorage.removeItem('finalSync');
         
         console.log('Logout process completed');
         
         return true;
      } catch (error) {
         console.error('Logout error:', error);
         // Try again in case of error
         try {
            await clearUserData();
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            await AsyncStorage.removeItem('isLoggingOut');
            await AsyncStorage.removeItem('finalSync');
         } catch (secondError) {
            console.error('Failed to clear storage:', secondError);
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
            console.log('getCurrentUser: No auth token found');
            return null;
         }

         // Then get user data
         const userData = await AsyncStorage.getItem('userData');
         if (!userData) {
            console.log('getCurrentUser: No user data found in storage');
            return null;
         }
         
         try {
            return JSON.parse(userData);
         } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            await AsyncStorage.removeItem('userData'); // Clear corrupted data
            return null;
         }
      } catch (error) {
         console.error('Error fetching user data from storage:', error);
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
         console.error('Error updating user data in storage:', error);
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
               console.log('Profile endpoint not implemented yet, using cached data');
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
