import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';

const AuthService = {
   /**
    * Login a user with email and password
    * @param {string} email - User's email
    * @param {string} password - User's password
    * @returns {Promise<Object>} User data and token
    */
   login: async (email, password) => {
      try {
         const response = await apiClient.post('/auth/login', { email, password });
         const { user, token } = response.data;

         // Changed from 'token' to 'userToken' to match what's used in UserService
         await AsyncStorage.setItem('userToken', token);
         // Store user data in AsyncStorage
         await AsyncStorage.setItem('userData', JSON.stringify(user));
         
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
      return !!token;
   },
   
   /**
    * Logout the current user
    * @returns {Promise<boolean>} Success status
    */
   logout: async () => {
      try {
         // Call logout endpoint (if your API requires it)
         await apiClient.post('/auth/logout');
         
         // Remove token and user data from storage
         await AsyncStorage.removeItem('userToken');
         await AsyncStorage.removeItem('userData');
         return true;
      } catch (error) {
         console.error('Logout error:', error);
         // Even if API call fails, clear token and user data locally
         await AsyncStorage.removeItem('userToken');
         await AsyncStorage.removeItem('userData');
         return false;
      }
   },
   
   /**
    * Get current user data from AsyncStorage
    * @returns {Promise<Object|null>} User data or null
    */
   getCurrentUser: async () => {
      try {
         const userData = await AsyncStorage.getItem('userData');
         return userData ? JSON.parse(userData) : null;
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
   }
};

export default AuthService;
