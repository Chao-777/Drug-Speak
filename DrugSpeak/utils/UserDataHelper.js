/**
 * Utility functions for handling and normalizing user data
 * This file centralizes user data operations to avoid duplication
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../api/authService';

const UserDataHelper = {
  /**
   * Get a normalized user name from user object with fallbacks
   * @param {Object} user - User object
   * @returns {string} Normalized user name
   */
  getNormalizedUserName: (user) => {
    if (!user) return 'Anonymous';
    return user.username || user.name || (user.email ? user.email.split('@')[0] : 'Anonymous');
  },

  /**
   * Create a complete user profile object with consistent field naming
   * @param {Object} user - Raw user object
   * @returns {Object} Normalized user object
   */
  createUserProfileObject: (user) => {
    if (!user) return null;
    
    const userId = user.id || user._id;
    const userName = UserDataHelper.getNormalizedUserName(user);
    
    return {
      id: userId,
      _id: userId, // Include both formats for compatibility
      username: userName,
      name: userName,
      email: user.email || '',
      gender: user.gender || 'Not specified',
      // Other standard fields can be added here as needed
    };
  },

  /**
   * Create a complete nested user object for inclusion in records
   * @param {Object} user - User object
   * @returns {Object} User data with nested user object 
   */
  createNestedUserObject: (user) => {
    if (!user) return null;
    
    const userId = user.id || user._id;
    const userName = UserDataHelper.getNormalizedUserName(user);
    
    return {
      userId: userId,
      username: userName,
      name: userName,
      email: user.email || '',
      gender: user.gender || 'Not specified',
      // Include a nested user object with full profile information
      user: {
        id: userId,
        _id: userId,
        username: userName,
        name: userName,
        email: user.email || '',
        gender: user.gender || 'Not specified'
      }
    };
  },

  /**
   * Get the current authenticated user with error handling
   * @returns {Promise<Object|null>} User object or null
   */
  getCurrentUserSafe: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return null;
      
      return await AuthService.getCurrentUser();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Check if a user is logged in
   * @returns {Promise<boolean>} Whether user is logged in
   */
  isUserLoggedIn: async () => {
    try {
      // Check if this is a special final sync operation before logout 
      const isFinalSync = await AsyncStorage.getItem('finalSync');
      if (isFinalSync === 'true') {
        return true;
      }
      
      // Check if a logout operation is in progress
      const isLoggingOut = await AsyncStorage.getItem('isLoggingOut');
      if (isLoggingOut === 'true') {
        return false;
      }
      
      const user = await AuthService.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  },

  /**
   * Calculate total score from learning list
   * @param {Array} learningList - The list of drugs being learned
   * @returns {number} Total score
   */
  calculateTotalScore: (learningList) => {
    if (!learningList || !Array.isArray(learningList)) return 0;
    return learningList.reduce((total, drug) => total + (drug.score || 0), 0);
  }
};

export default UserDataHelper; 
